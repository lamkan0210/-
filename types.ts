
export interface GenerationResult {
  id: string;
  theme: string;
  imageUrl: string;
  loading: boolean;
  error?: string;
}

export enum ThemeType {
  Professional = '职业肖像照',
  Fashion = '时尚写真',
  Gallery = '美术馆迷失的她',
  BlackWhite = '黑白艺术照',
  Magazine = '美式杂志封面',
  Cinematic = '电影肖像'
}
