import { ScrollConfig } from '../InfiniteScrollV2/InfiniteScrollV2Model';
import { isNil } from 'lodash';

export function calcLayout(layoutArr: any[], options: ScrollConfig): any[] {
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
