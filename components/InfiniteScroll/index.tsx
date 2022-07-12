import { Skeleton, Space } from 'antd';
import * as React from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { PostModel } from '../../models/postModel';
import PostItem from '../Posts/PostItem';

export class InfiniteScrollProps {
  items: PostModel[];
}

export default function InfiniteScroll({ items = [] }: InfiniteScrollProps) {
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
      <ScrollArea items={items} />
    </Space>
  );
}

function getScrollPercent(elem: HTMLDivElement): number {
  const scrollArea = elem;
  const maxScroll = scrollArea.scrollHeight - scrollArea.offsetHeight;
  const scrollPercent = (scrollArea.scrollTop * 100) / maxScroll;
  return scrollPercent;
}

function ScrollArea({ items = [] }: InfiniteScrollProps) {
  const [limit, setLimit] = useState(10);
  const [scroll, setScroll] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const data = items.filter((item) => item.id < limit);

  const onScroll = useCallback(() => {
    const { current: scrollArea } = scrollRef;
    const scrollPercent = getScrollPercent(scrollArea);
    setScroll(scrollPercent);
    if (scrollPercent > 80) {
      setLimit((curr) => {
        return curr + 25;
      });
    }
  }, []);

  useLayoutEffect(() => {
    const { current: scrollArea } = scrollRef;
    scrollArea.addEventListener('scroll', onScroll);
    return () => {
      scrollArea.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const { current: scrollArea } = scrollRef;
    if (limit >= items.length) {
      scrollArea.removeEventListener('scroll', onScroll);
    }
  }, [items, limit]);

  return (
    <div>
      <h4>
        Total item: {data.length + 1} - scrollPercent: {scroll.toFixed(2)}%
      </h4>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowY: 'scroll',
          height: '90vh',
          alignItems: 'center',
          flexFlow: 'column',
        }}
        ref={scrollRef}
      >
        {data.map((item, idx) => (
          <PostItem key={idx} data={item} />
        ))}
      </div>
    </div>
  );
}
