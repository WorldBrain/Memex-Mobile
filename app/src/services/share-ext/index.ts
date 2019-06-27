import ShareExtension from "react-native-share-extension";

import { ShareAPI } from "./types";

export interface Props {
  shareAPI?: ShareAPI;
}

export class ShareExt {
  private shareAPI: ShareAPI;

  constructor({ shareAPI = ShareExtension }: Props) {
    this.shareAPI = shareAPI;
  }

  async getShareText() {
    // TODO: Figure out what these are... What do I do with `type`?
    const { type, value } = await this.shareAPI.data();

    if (value && value.length) {
      return value;
    }
  }

  close = () => this.shareAPI.close()
}
