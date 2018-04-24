
export interface IRenderer {
    refresh(): void;
    destroy(): void;
    highlight(type: HighlightType): void;
}

export enum HighlightType {
    None,
    Message,
    Normal,
    Warn,
    Error
}