import { PostModel } from '../../models/postModel';

export class InfiniteScrollProps {
  items: (ScrollItem | PostModel)[];
}

export class ScrollConfig {
  itemGap: number = 10;
  scrollInterval: number = 300;
  endLine: string = 'You are up to date!!';
  showSkeletion: boolean = true;
}

export class PositionModel {
  top?: number = 0;
  left?: number = 0;
}

export class ScrollItem extends PostModel {
  uuid: number;
}

export class ScrollAreaProps {
  items: (ScrollItem | PostModel)[];
  renderItems?: (item: any) => any;
  initPage: number = 0;
  getItems: (params: any) => Promise<ScrollItem[]>;
  options?: ScrollConfig = new ScrollConfig();
}

export class LayoutModel {
  clientHeight: number;
  top: number;
  hide: boolean;
}

export class ItemWrapperModel {
  item: ScrollItem | PostModel;
  renderItems: (item: any) => any;
  onLoad;
  position: PositionModel;
}
