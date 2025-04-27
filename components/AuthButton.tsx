'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <div>
        <h1>こんにちは {session.user?.name} さん！</h1>
        <button onClick={() => signOut()}>ログアウト</button>
      </div>
    );
  } else {
    return (
      <div>
        <h1>ログインしてないよ</h1>
        <button onClick={() => signIn('google')}>Googleでログイン</button>
      </div>
    );
  }
}
