import { Card, Image, Skeleton } from 'antd';
import * as React from 'react';
import { PostModel } from '../../models/postModel';

export class PostItemProps {
  data: PostModel;
  showImage?: boolean;
}

export default function PostItem({ data, showImage = false }: PostItemProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    if (!showImage) return;
    fetch(`https://jsonplaceholder.typicode.com/photos/${data.id}`)
      .then((res) => res.json())
      .then((resp) => {
        setUrl(resp.url);
        setLoaded(true);
      });
  }, []);
  return (
    <Card
      title={`${data.id} - ${data.title}`}
      size="small"
      style={{ maxWidth: '500px' }}
    >
      {showImage && loaded && <Image width={200} src={url} />}
      {showImage && !loaded && (
        <Skeleton.Avatar active={true} shape={'square'} size={200} />
      )}
      <p>{data.body}</p>
    </Card>
  );
}
