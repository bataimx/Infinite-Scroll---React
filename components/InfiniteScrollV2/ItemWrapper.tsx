import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  memo,
} from 'react';
import React = require('react');
import {
  ItemWrapperModel,
  ScrollItem,
} from '../InfiniteScrollV2/InfiniteScrollV2.model';

const ItemWrapper = forwardRef(
  ({ item, renderItems, onLoad, position = {} }: ItemWrapperModel, ref) => {
    const topOffset = position.top || 0;
    const wrapperRef = useRef<HTMLDivElement>();
    // console.log('render ItemWrapper');

    useImperativeHandle(ref, () => wrapperRef.current);

    useLayoutEffect(() => {
      onLoad(wrapperRef.current.clientHeight, (item as ScrollItem).uuid);
    }, []);

    return (
      <div
        ref={wrapperRef}
        style={{ position: 'absolute', top: `${topOffset}px`, left: '0px' }}
      >
        {renderItems(item)}
      </div>
    );
  }
);
export default memo<ItemWrapperModel>(ItemWrapper);
