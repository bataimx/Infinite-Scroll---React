import { Skeleton } from 'antd';
import * as React from 'react';
import { PostModel } from '../../models/postModel';
import { MasonryInfiniteGrid } from '@egjs/react-infinitegrid';
import PostItem from '../Posts/PostItem';
import { useState } from 'react';

export class MansoryInfiniteProps {
  items: PostModel[];
}

export default function MansoryInfinite({ items = [] }: MansoryInfiniteProps) {
  const [limit, setLimit] = useState(10);
  const data = items.filter((item) => item.id <= limit);
  if (items.length === 0) {
    return <Skeleton />;
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: 'auto',
      }}
    >
      <MasonryInfiniteGrid
        align="center"
        gap={5}
        loading={<Skeleton />}
        onRequestAppend={(e) => {
          e.wait();
          setTimeout(() => {
            e.ready();
            setLimit((prev) => {
              if (prev >= items.length) return prev;
              return prev + 10;
            });
          }, 400);
        }}
      >
        {data.map((item, idx) => {
          return <PostItem key={idx} data={item} />;
        })}
      </MasonryInfiniteGrid>
    </div>
  );
}
