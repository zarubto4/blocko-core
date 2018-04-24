export interface IRenderer {
    refresh(): void;
    destroy(): void;
    highlight(type: HighlightType): void;
}
export declare enum HighlightType {
    None = 0,
    Message = 1,
    Normal = 2,
    Warn = 3,
    Error = 4,
}
