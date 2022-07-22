import { Skeleton, Space } from 'antd';
import * as React from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import PostItem from '../Posts/PostItem';
import { isNil, throttle } from 'lodash';
import {
  InfiniteScrollProps,
  LayoutModel,
  PositionModel,
  ScrollAreaProps,
  ScrollConfig,
  ScrollItem,
} from '../InfiniteScrollV2/InfiniteScrollV2.model';
import { calcLayout } from '../InfiniteScrollV2/calculators.utils';
import ItemWrapper from '../InfiniteScrollV2/ItemWrapper';

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
        initPage={0}
        getItems={({ nextPage, _currentPage }) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(getNextPage(nextPage) as ScrollItem[]);
            }, 400);
          });
        }}
        renderItems={(item) => <PostItem showImage={true} data={item} />}
      />
    </Space>
  );
}

function ScrollArea({
  initPage,
  getItems,
  renderItems = null,
  options = new ScrollConfig(),
}: ScrollAreaProps) {
  if (renderItems === null) {
    renderItems = (_item) => {
      return <p>dummy item</p>;
    };
  }

  const [items, setItems] = useState<ScrollItem[]>([]);
  const layoutIndexRef = useRef<number>(0);
  const page = useRef<number>(initPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [triggerPos, setTriggerPos] = useState<PositionModel>({
    top: 0,
    left: 0,
  });
  const [layout, setLayout] = useState<LayoutModel[]>([]);
  const isLoadingRef = useRef<boolean>(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);
  const [isLatestPage, setIsLatestPage] = useState<boolean>(false);

  const getScrollRange = useCallback(() => {
    const scrollAreaElem = scrollAreaRef.current;

    const minRange = scrollAreaElem.scrollTop;
    const maxRange = minRange + scrollAreaElem.clientHeight;
    const scrollGap = scrollAreaElem.clientHeight * 2;
    const minTop = minRange - scrollGap < 0 ? 0 : minRange - scrollGap;
    const maxTop = maxRange + scrollGap;
    return { minRange, maxRange, minTop, maxTop };
  }, []);

  const onTriggerLoadMore = useCallback((ev) => {
    if (!ev[0].isIntersecting) return;
    if (isLoadingRef.current || layoutIndexRef.current === 0) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    const currentPage = +page.current;
    const nextPage = ++page.current;
    getItems({ nextPage, currentPage })
      .then((items) =>
        items.map((item) => {
          item.uuid = layoutIndexRef.current++;
          return item;
        })
      )
      .then((nextItems) => {
        isLoadingRef.current = false;
        console.log('onTriggerLoadMore');
        if (nextItems.length === 0) {
          setIsLatestPage(true);
          observerRef.current.disconnect();
        }
        setItems((prev) => [...prev, ...nextItems]);
        setIsLoading(false);
      });
  }, []);

  const onTriggerScroll = useCallback(
    throttle(() => {
      const appRefElem = scrollAreaRef.current;
      if (isNil(appRefElem.scrollTop)) return;
      const { minTop, maxTop } = getScrollRange();
      const reload = layout.some(
        (item) => item && minTop < item.top && item.top <= maxTop && item.hide
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
    }, options.scrollInterval),
    [layout]
  );

  useEffect(() => {
    getItems({ nextPage: initPage })
      .then((resp) =>
        resp.map((item) => {
          item.uuid = layoutIndexRef.current++;
          return item;
        })
      )
      .then((nextItems) => setItems(nextItems));
  }, []);

  useLayoutEffect(() => {
    const appRefElem = scrollAreaRef.current;
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
    const lastItem = items[items.length - 1];
    if (isNil(lastItem)) return;
    const position = layout[lastItem.uuid];
    if (isNil(position)) return;
    const triggerTop = position.top + position.clientHeight + options.itemGap;
    setTriggerPos((prev) => ({ ...prev, top: triggerTop }));
  }, [layout]);

  const handleOnLoad = useCallback((clientHeight, uuid) => {
    setLayout((prevLayout) => {
      const { minTop, maxTop } = getScrollRange();
      prevLayout[uuid] = { ...prevLayout[uuid], clientHeight };
      return calcLayout(prevLayout, options).map((item) => {
        item.hide = item.top < minTop || item.top >= maxTop;
        return item;
      });
    });
  }, []);

  const itemList = React.useMemo(() => {
    return items.reduce((prev, item) => {
      if (
        !layout[item.uuid] ||
        (layout[item.uuid] && !layout[item.uuid].hide)
      ) {
        return [
          ...prev,
          <ItemWrapper
            key={item.uuid}
            item={item}
            position={{ top: layout[item.uuid] && layout[item.uuid].top }}
            renderItems={renderItems}
            onLoad={handleOnLoad}
          />,
        ];
      }
      return prev;
    }, []);
  }, [layout, items]);

  return (
    <div>
      <h4>
        Total item: {items.length}{' '}
        {`itemOnPage: ${layout.filter((item) => !item.hide).length}`}{' '}
        {isLoading && 'loading...'}{' '}
      </h4>
      <div
        ref={scrollAreaRef}
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
          {isLatestPage && <p>{options.endLine}</p>}
          {!isLatestPage && options.showSkeletion && <Skeleton />}
        </div>
      </div>
    </div>
  );
}
