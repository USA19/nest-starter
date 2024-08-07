export class CurrentUserInterface {
  email: string
  sub: string
  iat: number
  exp: number
  roles: string[]
}

export class SocialUserInterface {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}