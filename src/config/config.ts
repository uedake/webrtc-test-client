import { Amplify } from "aws-amplify";

//ユーザーのAWSリソースに合わせて設定////////////////////
//通常WebアプリごとにUSER_POOL_CLIENT_IDとidentityPoolIdDictは異なる
//ユーザープールを共有している場合USER_POOL_POSTFIXは同じ
export const ACCOUNT = "821721610090"
export const REGION = "ap-northeast-1"
const USER_POOL_POSTFIX = "kw2EVel03"

const USER_POOL_CLIENT_ID = "5kc94hauhqn0mlradac17ugref"
const identityPoolIdDict = {
  test: "ap-northeast-1:4fd2b79e-67ea-4321-8f44-ec655a048aa1",
  dev: "ap-northeast-1:db21d1ff-6c8a-40f9-be25-c837a60cb97e",
  main: "	ap-northeast-1:14952683-b1de-465b-b462-2dda586ab4e1"
}
const ENV_KEYS = {
  BRANCH: "VITE_Branch",
} as const;
//////////////////////////////////////////////////////

const USING_VITE = true

const env_provider = USING_VITE ? import.meta : process
export const branch = env_provider.env ? (env_provider.env[ENV_KEYS.BRANCH] as "main" | "dev" | "test" || "test") : "test"
if (branch !== "main" && branch !== "dev" && branch !== "test") {
  throw Error("implemented error")
}

export function configureAmplify() {
  const redirect_uri = `${window.location.protocol}//${window.location.host}/`
  const identityPoolId = identityPoolIdDict[branch]

  const authconfig = {
    Auth: {
      Cognito: {
        userPoolId: `${REGION}_${USER_POOL_POSTFIX}`,
        userPoolClientId: USER_POOL_CLIENT_ID,
        identityPoolId: identityPoolId,
        loginWith: {
          oauth: {
            domain: `${REGION}${USER_POOL_POSTFIX}.auth.${REGION}.amazoncognito.com`,
            scopes: ["email", "openid", "aws.cognito.signin.user.admin"],
            responseType: "code" as const,
            redirectSignIn: [redirect_uri],
            redirectSignOut: [redirect_uri],
          }
        }
      }
    }
  };
  Amplify.configure(authconfig)
};

configureAmplify();
