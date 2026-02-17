import { Editor, EditorPosition } from 'obsidian';
import EquationCitator from '@/main';

// Mock the necessary parts
jest.mock('obsidian');

describe('boxSelectedEquation', () => {
    let mockEditor: jest.Mocked<Editor>;
    let mockPlugin: jest.Mocked<EquationCitator>;

    beforeEach(() => {
        mockEditor = {
            getValue: jest.fn(),
            getCursor: jest.fn(),
            replaceRange: jest.fn(),
        } as any;

        mockPlugin = {
            settings: {
                skipFirstlineInBoxedFilter: false,
                enableTypstMode: false,
                typstBoxSymbol: 'rect',
            },
            app: {
                workspace: {
                    getActiveViewOfType: jest.fn().mockReturnValue({
                        editor: mockEditor,
                    }),
                },
            },
        } as any;
    });

    describe('Single-line equations (no quotes)', () => {
        it('should wrap a simple single-line equation', () => {
            const content = '$$ E = mc^2 $$';
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 0, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{E = mc^2}',
                { line: 0, ch: 2 },
                { line: 0, ch: 12 }
            );
        });

        it('should wrap a single-line equation with tag', () => {
            const content = '$$ F = ma \\tag{eq:1} $$';
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 0, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{F = ma \\tag{eq:1}}',
                { line: 0, ch: 2 },
                { line: 0, ch: 21 }
            );
        });
    });

    describe('Multi-line equations (no quotes)', () => {
        it('should wrap a simple multi-line equation', () => {
            const content = `$$
p = mv
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 1, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{p = mv}\n',
                { line: 1, ch: 0 },
                { line: 2, ch: 0 }
            );
        });

        it('should wrap multi-line equation with align environment', () => {
            const content = `$$
\\begin{align}
F = ma \\\\
a = md
\\end{align}
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 2, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{\\begin{align}\nF = ma \\\\\na = md\n\\end{align}}\n',
                { line: 1, ch: 0 },
                { line: 5, ch: 0 }
            );
        });

        it('should wrap multi-line equation with label on first line', () => {
            const content = `$$phy
\\begin{align}
F = ma \\\\
a = md
\\end{align}
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 2, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{phy\n\\begin{align}\nF = ma \\\\\na = md\n\\end{align}}\n',
                { line: 0, ch: 2 },
                { line: 5, ch: 0 }
            );
        });

        it('should handle skipFirstlineInBoxedFilter for multi-line equations', () => {
            mockPlugin.settings.skipFirstlineInBoxedFilter = true;
            const content = `$$
\\begin{align}
F = ma \\\\
a = md
\\end{align}
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 2, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\begin{align}\n\\boxed{F = ma \\\\\na = md\n\\end{align}}\n',
                { line: 1, ch: 0 },
                { line: 5, ch: 0 }
            );
        });

        it('should handle skipFirstlineInBoxedFilter with label on first line', () => {
            mockPlugin.settings.skipFirstlineInBoxedFilter = true;
            const content = `$$phy
\\begin{align}
F = ma \\\\
a = md
\\end{align}
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 2, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                'phy\n\\boxed{\\begin{align}\nF = ma \\\\\na = md\n\\end{align}}\n',
                { line: 0, ch: 2 },
                { line: 5, ch: 0 }
            );
        });

        it('should NOT skip first line when it is blank with skipFirstlineInBoxedFilter', () => {
            mockPlugin.settings.skipFirstlineInBoxedFilter = true;
            const content = `$$

\\begin{align}
F = ma \\\\
a = md
\\end{align}
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 3, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            // When first line is blank, should wrap everything
            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{\\begin{align}\nF = ma \\\\\na = md\n\\end{align}}\n',
                { line: 2, ch: 0 },
                { line: 6, ch: 0 }
            );
        });
    });

    describe('Single-line equations in quotes', () => {
        it('should wrap a single-line equation in a quote block', () => {
            const content = `> [!NOTE]
> $$ p = mv $$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 1, ch: 7 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{p = mv}',
                { line: 1, ch: 4 },
                { line: 1, ch: 12 }
            );
        });
    });

    describe('Multi-line equations in quotes', () => {
        it('should wrap a multi-line equation in a quote block', () => {
            const content = `> [!NOTE]
> $$
> p = mv
> $$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 2, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{p = mv}\n> ',
                { line: 2, ch: 2 },
                { line: 3, ch: 2 }
            );
        });

        it('should wrap multi-line equation with align in quote block', () => {
            const content = `> [!NOTE]
> $$
> \\begin{align}
> F = ma \\\\
> a = md
> \\end{align}
> $$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 3, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\boxed{\\begin{align}\n> F = ma \\\\\n> a = md\n> \\end{align}}\n> ',
                { line: 2, ch: 2 },
                { line: 6, ch: 2 }
            );
        });

        it('should handle skipFirstlineInBoxedFilter for multi-line equations in quotes', () => {
            mockPlugin.settings.skipFirstlineInBoxedFilter = true;
            const content = `> [!NOTE]
> $$
> \\begin{align}
> F = ma \\\\
> a = md
> \\end{align}
> $$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 3, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                '\\begin{align}\n> \\boxed{F = ma \\\\\n> a = md\n> \\end{align}}\n> ',
                { line: 2, ch: 2 },
                { line: 6, ch: 2 }
            );
        });
    });

    describe('Typst mode', () => {
        beforeEach(() => {
            mockPlugin.settings.enableTypstMode = true;
        });

        it('should use Typst syntax for single-line equation', () => {
            const content = '$$ E = mc^2 $$';
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 0, ch: 5 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                'rect(E = mc^2)',
                { line: 0, ch: 2 },
                { line: 0, ch: 12 }
            );
        });

        it('should use Typst syntax for multi-line equation', () => {
            const content = `$$
p = mv
$$`;
            mockEditor.getValue.mockReturnValue(content);
            mockEditor.getCursor.mockReturnValue({ line: 1, ch: 3 } as EditorPosition);

            const { boxSelectedEquation } = require('@/func/equations_helper');
            boxSelectedEquation(mockPlugin);

            expect(mockEditor.replaceRange).toHaveBeenCalledWith(
                'rect(p = mv)\n',
                { line: 1, ch: 0 },
                { line: 2, ch: 0 }
            );
        });
    });
});
