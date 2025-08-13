// types/navigation.ts
export type RootParamList = {
  '(auth)': {
    screen?: 'login' | 'activation' | 'tenantscreen';
  };
  '(tabs)': {
    screen?: 'index' | 'places' | 'refuel' | 'stations' | 'profile';
  };
  '+not-found': undefined;
};
