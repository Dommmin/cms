import { createContext, useContext, useState, type JSX } from 'react';

export type BlockType =
    | 'bullet'
    | 'check'
    | 'code'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'number'
    | 'paragraph'
    | 'quote';

interface ToolbarContextValue {
    blockType: BlockType;
    setBlockType: (blockType: BlockType) => void;
    selectedElementKey: string | null;
    setSelectedElementKey: (key: string | null) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    fontColor: string;
    setFontColor: (color: string) => void;
    bgColor: string;
    setBgColor: (color: string) => void;
    fontFamily: string;
    setFontFamily: (family: string) => void;
    elementFormat: string;
    setElementFormat: (format: string) => void;
    isLink: boolean;
    setIsLink: (isLink: boolean) => void;
    isBold: boolean;
    setIsBold: (isBold: boolean) => void;
    isItalic: boolean;
    setIsItalic: (isItalic: boolean) => void;
    isUnderline: boolean;
    setIsUnderline: (isUnderline: boolean) => void;
    isStrikethrough: boolean;
    setIsStrikethrough: (isStrikethrough: boolean) => void;
    isSubscript: boolean;
    setIsSubscript: (isSubscript: boolean) => void;
    isSuperscript: boolean;
    setIsSuperscript: (isSuperscript: boolean) => void;
    isCode: boolean;
    setIsCode: (isCode: boolean) => void;
    canUndo: boolean;
    setCanUndo: (canUndo: boolean) => void;
    canRedo: boolean;
    setCanRedo: (canRedo: boolean) => void;
    codeLanguage: string;
    setCodeLanguage: (lang: string) => void;
    isEditable: boolean;
    setIsEditable: (isEditable: boolean) => void;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export function ToolbarContextProvider({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const [blockType, setBlockType] = useState<BlockType>('paragraph');
    const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
        null,
    );
    const [fontSize, setFontSize] = useState('15px');
    const [fontColor, setFontColor] = useState('#000');
    const [bgColor, setBgColor] = useState('#fff');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [elementFormat, setElementFormat] = useState('left');
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState('');
    const [isEditable, setIsEditable] = useState(true);

    return (
        <ToolbarContext.Provider
            value={{
                blockType,
                setBlockType,
                selectedElementKey,
                setSelectedElementKey,
                fontSize,
                setFontSize,
                fontColor,
                setFontColor,
                bgColor,
                setBgColor,
                fontFamily,
                setFontFamily,
                elementFormat,
                setElementFormat,
                isLink,
                setIsLink,
                isBold,
                setIsBold,
                isItalic,
                setIsItalic,
                isUnderline,
                setIsUnderline,
                isStrikethrough,
                setIsStrikethrough,
                isSubscript,
                setIsSubscript,
                isSuperscript,
                setIsSuperscript,
                isCode,
                setIsCode,
                canUndo,
                setCanUndo,
                canRedo,
                setCanRedo,
                codeLanguage,
                setCodeLanguage,
                isEditable,
                setIsEditable,
            }}
        >
            {children}
        </ToolbarContext.Provider>
    );
}

export function useToolbarContext(): ToolbarContextValue {
    const context = useContext(ToolbarContext);
    if (!context)
        throw new Error(
            'useToolbarContext must be used within ToolbarContextProvider',
        );
    return context;
}
