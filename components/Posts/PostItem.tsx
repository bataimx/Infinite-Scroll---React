import { Card } from 'antd';
import * as React from 'react';
import { PostModel } from '../../models/postModel';

export class PostItemProps {
  data: PostModel;
}

export default function PostItem({ data }: PostItemProps) {
  return (
    <Card
      title={`${data.id} - ${data.title}`}
      size="small"
      style={{ maxWidth: '500px' }}
    >
      <p>{data.body}</p>
    </Card>
  );
}
