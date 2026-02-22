"use client";

import { useEffect, useState } from "react";

export default function TokenStatus() {
  const [token, setToken] = useState<string | null>(null);
  const [cookie, setCookie] = useState<string | null>(null);

  useEffect(() => {
    try {
      setToken(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      setCookie(typeof document !== 'undefined' ? document.cookie : null);
      console.log('[TokenStatus] token:', localStorage.getItem('token'));
      console.log('[TokenStatus] cookies:', document.cookie);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div style={{position: 'fixed', right: 12, bottom: 12, zIndex:9999}}>
      <div style={{background: 'rgba(0,0,0,0.7)', color: 'white', padding: 8, borderRadius: 6, fontSize: 12}}>
        <div><strong>token:</strong> {token ? 'PRESENT' : 'NONE'}</div>
        <div style={{marginTop:4}}><strong>cookie:</strong> {cookie ? cookie : 'NONE'}</div>
      </div>
    </div>
  );
}
