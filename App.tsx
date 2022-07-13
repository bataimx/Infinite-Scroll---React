import * as React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import InfiniteScroll from './components/InfiniteScroll';
import InfiniteScrollV2 from './components/InfiniteScrollV2';
import MansoryInfinite from './components/MansoryInfinite';
import Posts from './components/Posts';
import { PostModel } from './models/postModel';
import './style.css';

export default function App() {
  const [data, setData] = useState<PostModel[]>([]);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((resp: PostModel[]) => {
        setData(resp);
      });
  }, []);

  return (
    <div style={{ padding: '10px' }}>
      <Routes>
        <Route path="*" element={<Navigate to="/normal" replace />} />
        <Route path="normal" element={<Posts items={data} />} />
        <Route path="infinite" element={<InfiniteScroll items={data} />} />
        <Route
          path="infinite-v2"
          element={
            <InfiniteScrollV2
              items={[
                ...data,
                ...data.map((item) => {
                  return { ...item, id: 200 + item.id };
                }),
              ]}
            />
          }
        />
        <Route
          path="mansory-infinite"
          element={<MansoryInfinite items={data} />}
        />
      </Routes>
    </div>
  );
}
