import { Skeleton, Space } from 'antd';
import * as React from 'react';
import { PostModel } from '../../models/postModel';
import PostItem from '../Posts/PostItem';

export class PostsProps {
  items: PostModel[];
}

export default function Posts({ items = [] }: PostsProps) {
  if (items.length === 0) {
    return <Skeleton />;
  }

  return (
    <Space
      direction="vertical"
      size="middle"
      align="center"
      style={{ display: 'flex' }}
    >
      {items.map((item, idx) => (
        <PostItem key={idx} data={item} />
      ))}
    </Space>
  );
}
