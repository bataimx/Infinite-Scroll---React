import { Skeleton, Space } from 'antd';
import * as React from 'react';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { PostModel } from '../../models/postModel';
import PostItem from '../Posts/PostItem';
import { isNil, throttle } from 'lodash';

export class InfiniteScrollProps {
  items: PostModel[];
}

export default function InfiniteScrollV2({ items = [] }: InfiniteScrollProps) {
  if (items.length === 0) {
    return <Skeleton />;
  }

  const getNextPage = useCallback(
    (page) => {
      const len = items.length;
      const itemsPerPage = 10;
      const totalPage =
        len >= itemsPerPage
          ? Math.round(len / itemsPerPage) + (len % itemsPerPage)
          : 1;
      if (page > totalPage) return [];
      const start = page * itemsPerPage;
      return items.slice(start, start + itemsPerPage);
    },
    [items]
  );

  return (
    <Space
      direction="vertical"
      size="middle"
      align="center"
      style={{ display: 'flex' }}
    >
      <ScrollArea
        items={items}
        initPage={0}
        getItems={({ nextPage, _currentPage }) => {
          return getNextPage(nextPage);
        }}
        renderItems={(item) => <PostItem data={item} />}
      />
    </Space>
  );
}

class ScrollConfig {
  itemStartLen: number = 10;
  itemPerLoad: number = 10;
  itemOnPage: number = 20;
  itemGap: number = 10;
  endLine: string = 'You are up to date!!';
  showSkeletion: boolean = true;
}

class ScrollAreaProps extends InfiniteScrollProps {
  renderItems?: (item: any) => any;
  initPage: number = 0;
  getItems?: (params: any) => any[];
  options?: ScrollConfig = new ScrollConfig();
}

class LoadMoreClass {
  isLoading: boolean;
  limit: number;
}

const fetchItem = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 400);
  });

function ScrollArea({
  initPage,
  getItems,
  renderItems = null,
  options = new ScrollConfig(),
}: ScrollAreaProps) {
  if (renderItems === null) {
    renderItems = (item: PostModel) => {
      return <p>{item.id}</p>;
    };
  }
  const [items, setItems] = useState<PostModel[]>(
    getItems({ nextPage: initPage })
  );
  const page = useRef<number>(initPage);
  const [loadMore, setLoadMore] = useState<LoadMoreClass>({
    isLoading: false,
    limit: options.itemStartLen,
  });
  const [triggerPos, setTriggerPos] = useState({ top: 0, left: 0 });
  const [layout, setLayout] = useState<any[]>([]);
  const isLoadingRef = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);

  const getScrollRange = useCallback(() => {
    const minRange = appRef.current.scrollTop;
    const maxRange = minRange + appRef.current.clientHeight;
    const scrollGap = appRef.current.clientHeight;
    const minTop = minRange - scrollGap < 0 ? 0 : minRange - scrollGap;
    const maxTop = maxRange + scrollGap;
    return { minRange, maxRange, minTop, maxTop };
  }, []);

  const onTriggerLoadMore = useCallback((ev) => {
    if (!ev[0].isIntersecting) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoadMore((prev) => ({ ...prev, isLoading: true }));
    fetchItem().then(() => {
      isLoadingRef.current = false;
      console.log('here in onTriggerLoadMore');
      const currentPage = +page.current;
      const nextPage = ++page.current;
      const nextItems = getItems({ nextPage, currentPage });
      if (nextItems.length === 0) {
        observerRef.current.disconnect();
      }
      setItems((prev) => [...prev, ...nextItems]);
      setLoadMore((prev) => ({ ...prev, isLoading: false }));
    });
  }, []);

  const onTriggerScroll = useCallback(
    throttle(() => {
      const appRefElem = appRef.current;
      if (isNil(appRefElem.scrollTop)) return;
      const { minRange, maxRange, minTop, maxTop } = getScrollRange();
      const reload = layout.some(
        (item) =>
          item && minRange < item.top && item.top <= maxRange && item.hide
      );
      if (reload) {
        setLayout((prevLayout) => {
          console.log('onTriggerScroll');
          return prevLayout.map((item) => {
            item.hide = item.top < minTop || item.top >= maxTop;
            return item;
          });
        });
      }
    }, 300),
    [layout]
  );

  useLayoutEffect(() => {
    const appRefElem = appRef.current;
    appRefElem.addEventListener('scroll', onTriggerScroll);

    return () => {
      appRefElem.removeEventListener('scroll', onTriggerScroll);
    };
  }, [layout]);

  useEffect(() => {
    const { current: scrollTrigger } = triggerRef;
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(onTriggerLoadMore, options);
    observerRef.current.observe(scrollTrigger);

    return () => {
      observerRef.current.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const lastItemId = items[items.length - 1].id;
    const position = layout[lastItemId];
    if (position) {
      const triggerTop = position.top + position.clientHeight + options.itemGap;
      setTriggerPos((prev) => ({ ...prev, top: triggerTop }));
    }
  }, [layout]);

  const handleOnLoad = useCallback((clientHeight, id) => {
    setLayout((prevLayout) => {
      const { minTop, maxTop } = getScrollRange();
      prevLayout[id] = { ...prevLayout[id], clientHeight };
      return calcLayout(prevLayout, options).map((item) => {
        item.hide = item.top < minTop || item.top >= maxTop;
        return item;
      });
    });
  }, []);

  const itemList = items
    .filter((item) => {
      if (layout[item.id]) {
        return !layout[item.id].hide;
      }
      return true;
    })
    .map((item, idx) => {
      return (
        <ItemWrapper
          key={idx}
          item={item}
          top={layout[item.id] && layout[item.id].top}
          renderItems={renderItems}
          onLoad={handleOnLoad}
        />
      );
    });
  return (
    <div>
      <h4>
        Total item: {items.length} itemOnPage:{' '}
        {layout.filter((item) => !item.hide).length}{' '}
        {loadMore.isLoading && 'loading...'}{' '}
      </h4>
      <div
        ref={appRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowY: 'scroll',
          height: '85vh',
          width: '520px',
          alignItems: 'center',
          flexFlow: 'column',
          position: 'relative',
        }}
      >
        {itemList}
        <div
          ref={triggerRef}
          style={{
            width: '100%',
            position: 'absolute',
            top: `${triggerPos.top}px`,
            left: `${triggerPos.left}px`,
          }}
        >
          {<p>{options.endLine}</p>}
          {options.showSkeletion && <Skeleton />}
        </div>
      </div>
    </div>
  );
}
const ItemWrapper = memo(
  forwardRef(({ item, renderItems, onLoad, top = null }: any, ref) => {
    const topOffset = top || 0;
    const wrapperRef = useRef<HTMLDivElement>();
    // console.log('render ItemWrapper');

    useImperativeHandle(ref, () => wrapperRef.current);

    useLayoutEffect(() => {
      onLoad(wrapperRef.current.clientHeight, item.id);
    }, []);

    return (
      <div
        ref={wrapperRef}
        style={{ position: 'absolute', top: `${topOffset}px`, left: '0px' }}
      >
        {renderItems(item)}
      </div>
    );
  })
);
function calcLayout(layoutArr: any[], options: ScrollConfig): any[] {
  return layoutArr.map((item, idx) => {
    const layout = layoutArr[idx - 1];
    if (isNil(item) || !isNil(item.top)) {
      return item;
    }
    const prevTop = layout && layout.top ? layout.top : 0;
    const prevClientHeight =
      layout && layout.clientHeight ? layout.clientHeight : 0;
    const top = prevTop + prevClientHeight;
    item.top = top + options.itemGap;
    return item;
  });
}
