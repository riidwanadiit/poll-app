// src/components/DataFetcher.tsx
"use client";

import { useEffect, useState } from "react";
import app from "@component/firebase/config";
import { getDatabase, ref, onValue } from "firebase/database";

export default function DataFetcher() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    const db = getDatabase(app);
    const dbRef = ref(db, "sample/data");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Firebase Realtime Data:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
