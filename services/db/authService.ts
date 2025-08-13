import { APP_URL } from '@/lib/api';
import { openDatabase } from '@/services/db/migrations';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

export async function login(
  email: string,
  password: string,
  tenant: string
): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `https://${tenant}/api/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Tenant': tenant, // Use full tenant domain (e.g., webfixerr.spinthewheel.in)
        },
      }
    );
    console.log('Login request headers:', { 'X-Tenant': tenant });
    console.log('Login response:', response);
    const data = response.data;
    if (data.code === 'ACCOUNT_NOT_ACTIVATED') {
      throw new Error('User not activated');
    }
    const { access_token, user } = data;
    if (!access_token || !user?.id || !user?.name || !user?.email) {
      throw new Error('Invalid response from server');
    }

    const db = openDatabase();
    db.withTransactionSync(() => {
      db.runSync(
        `INSERT OR REPLACE INTO auth (id, token, user_id, user_name, user_email, tenant) VALUES (1, ?, ?, ?, ?, ?);`,
        [access_token, user.id.toString(), user.name, user.email, tenant]
      );
    });
    console.log('Auth data saved to SQLite');
    return { access_token, user };
  } catch (error: any) {
    console.error(
      'Login API error:',
      error,
      error.response?.data || error.message
    );
    if (error.response?.data?.code === 'ACCOUNT_NOT_ACTIVATED') {
      throw new Error('User not activated');
    }
    throw new Error(
      error.response?.data?.message || 'Invalid email or password'
    );
  }
}

export function logout(): void {
  try {
    const db = openDatabase();
    db.withTransactionSync(() => {
      db.runSync(`DELETE FROM auth WHERE id = 1;`, []);
    });
    console.log('Auth data cleared from SQLite');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export function loadAuth(): (LoginResponse & { tenant: string }) | null {
  try {
    const db = openDatabase();
    let result:
      | {
          token: string;
          user_id: string;
          user_name: string;
          user_email: string;
          tenant: string;
        }
      | null
      | undefined;
    db.withTransactionSync(() => {
      result = db.getFirstSync(
        `SELECT token, user_id, user_name, user_email, tenant FROM auth WHERE id = 1;`
      );
    });
    if (
      result &&
      result.token &&
      result.user_id &&
      result.user_name &&
      result.user_email &&
      result.tenant
    ) {
      console.log('Auth data loaded from SQLite:', result);
      return {
        access_token: result.token,
        user: {
          id: result.user_id,
          name: result.user_name,
          email: result.user_email,
        },
        tenant: result.tenant,
      };
    }
    console.log('No valid auth data found in SQLite');
    return null;
  } catch (error) {
    console.error('Error loading auth data:', error);
    return null;
  }
}

export function debugAuthTable(): void {
  try {
    const db = openDatabase();
    db.withTransactionSync(() => {
      const result = db.getAllSync('SELECT * FROM auth;');
      console.log('Auth table contents:', result);
    });
  } catch (error) {
    console.error('Error reading auth table:', error);
  }
}

export async function activateUser(
  email: string,
  code: string,
  tenant: string
): Promise<void> {
  try {
    const response = await axios.post(
      `https://${tenant}/api/activate`,
      { email, code },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Tenant': tenant,
        },
      }
    );
    console.log('Activate response:', response.data);
    if (response.data.message !== 'Account activated successfully.') {
      throw new Error(response.data.message || 'Activation failed');
    }
  } catch (error: any) {
    console.error('Activate API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Activation error');
  }
}

export async function resendPin(email: string, tenant: string): Promise<void> {
  try {
    const response = await axios.post(
      `https://${tenant}/api/resend-code`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Tenant': tenant,
        },
      }
    );
    console.log('Resend code response:', response.data);
    if (response.data.message !== 'Activation code resent successfully.') {
      throw new Error(response.data.message || 'Failed to resend code');
    }
  } catch (error: any) {
    console.error(
      'Resend code API error:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || 'Resend error');
  }
}
