import { autoNumberFigures } from '@/utils/core/auto_number_figures';
import { AutoNumberingType } from '@/utils/core/auto_number_core';

// Mock dependencies
jest.mock('@/debug/debugger', () => ({
    Debugger: {}
}));

// Helper function to create config and call autoNumberFigures
function runAutoNumberFig(
    content: string,
    autoNumberingType: AutoNumberingType,
    maxDepth: number,
    delimiter: string,
    noHeadingPrefix: string,
    globalPrefix: string,
    figCitationPrefix: string,
    parseQuotes = false,
    enableTaggedOnly = false
) {
    return autoNumberFigures(content, {
        autoNumberingType,
        maxDepth,
        delimiter,
        noHeadingPrefix,
        globalPrefix,
        parseQuotes,
        enableTaggedOnly,
        figCitationPrefix
    });
}

describe('autoNumberFigures', () => {
    describe('Relative Numbering - WikiLink Format', () => {
        test('should handle figures before any heading with P prefix', () => {
            const content = `![[image1.png]]

![[image2.png]]

# Chapter 1

![[image3.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:P1]]');
            expect(result).toContain('![[image2.png|fig:P2]]');
            expect(result).toContain('![[image3.png|fig:1.1]]');
        });

        test('should handle hierarchical numbering with headings', () => {
            const content = `# Chapter 1

![[fig1.png]]

## Section A

![[fig2.png]]

### Subsection A1

![[fig3.png]]

# Chapter 2

![[fig4.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[fig1.png|fig:1.1]]');
            expect(result).toContain('![[fig2.png|fig:1.1.1]]');
            expect(result).toContain('![[fig3.png|fig:1.1.1.1]]');
            expect(result).toContain('![[fig4.png|fig:2.1]]');
        });

        test('should preserve size parameter (numeric last part)', () => {
            const content = `# Chapter 1

![[image.png|400]]

![[image2.png|title:Test|500]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image.png|fig:1.1|400]]');
            expect(result).toContain('![[image2.png|title:Test|fig:1.2|500]]');
        });

        test('should preserve title and description metadata', () => {
            const content = `# Chapter 1

![[image.png|title:My Title]]

![[image2.png|desc:My Description]]

![[image3.png|title:Title|desc:Description]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image.png|title:My Title|fig:1.1]]');
            expect(result).toContain('![[image2.png|desc:My Description|fig:1.2]]');
            expect(result).toContain('![[image3.png|title:Title|desc:Description|fig:1.3]]');
        });

        test('should preserve metadata with size parameter', () => {
            const content = `# Chapter 1

![[image.png|title:Title|desc:Description|600]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image.png|title:Title|desc:Description|fig:1.1|600]]');
        });

        test('should replace existing tags with new tags', () => {
            const content = `# Chapter 1

![[image1.png|fig:old1]]

![[image2.png|fig:old2|400]]

![[image3.png|title:Test|fig:old3]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:1.1]]');
            expect(result).toContain('![[image2.png|fig:1.2|400]]');
            expect(result).toContain('![[image3.png|title:Test|fig:1.3]]');
            expect(result).not.toContain('fig:old1');
            expect(result).not.toContain('fig:old2');
            expect(result).not.toContain('fig:old3');
        });

        test('should handle custom delimiter', () => {
            const content = `# Chapter 1

![[image1.png]]

## Section A

![[image2.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '-', 'P', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:1-1]]');
            expect(result).toContain('![[image2.png|fig:1-1-1]]');
        });

        test('should handle custom noHeadingPrefix', () => {
            const content = `![[image1.png]]

![[image2.png]]

# Chapter 1

![[image3.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'FIG', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:FIG1]]');
            expect(result).toContain('![[image2.png|fig:FIG2]]');
            expect(result).toContain('![[image3.png|fig:1.1]]');
        });

        test('should handle no headings (all with prefix)', () => {
            const content = `![[image1.png]]

![[image2.png]]

![[image3.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:P1]]');
            expect(result).toContain('![[image2.png|fig:P2]]');
            expect(result).toContain('![[image3.png|fig:P3]]');
        });

        test('should handle maxDepth = 1 (simple numbering)', () => {
            const content = `# Chapter 1

![[image1.png]]

## Section A

![[image2.png]]

# Chapter 2

![[image3.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 1, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image1.png|fig:1]]');
            expect(result).toContain('![[image2.png|fig:2]]');
            expect(result).toContain('![[image3.png|fig:3]]');
        });
    });

    describe('Relative Numbering - Markdown Format', () => {
        test('should handle markdown format images', () => {
            const content = `# Chapter 1

![](image1.png)

## Section A

![](image2.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![fig:1.1](image1.png)');
            expect(result).toContain('![fig:1.1.1](image2.png)');
        });

        test('should preserve size parameter in markdown format', () => {
            const content = `# Chapter 1

![400](image.png)

![title:Test|500](image2.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![fig:1.1|400](image.png)');
            expect(result).toContain('![title:Test|fig:1.2|500](image2.png)');
        });

        test('should preserve title and description in markdown format', () => {
            const content = `# Chapter 1

![title:My Title](image.png)

![desc:My Description](image2.png)

![title:Title|desc:Description](image3.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![title:My Title|fig:1.1](image.png)');
            expect(result).toContain('![desc:My Description|fig:1.2](image2.png)');
            expect(result).toContain('![title:Title|desc:Description|fig:1.3](image3.png)');
        });

        test('should replace existing tags in markdown format', () => {
            const content = `# Chapter 1

![fig:old1](image1.png)

![fig:old2|400](image2.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![fig:1.1](image1.png)');
            expect(result).toContain('![fig:1.2|400](image2.png)');
            expect(result).not.toContain('fig:old1');
            expect(result).not.toContain('fig:old2');
        });
    });

    describe('Absolute Numbering (Hierarchical)', () => {
        test('should number figures according to heading hierarchy', () => {
            const content = `# Chapter 1
![[fig1.png]]

## Section 1.1
![[fig2.png]]

### Subsection 1.1.1
![[fig3.png]]

![[fig4.png]]

## Section 1.2
![[fig5.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Absolute, 6, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[fig1.png|fig:1.1]]');
            expect(result).toContain('![[fig2.png|fig:1.1.1]]');
            expect(result).toContain('![[fig3.png|fig:1.1.1.1]]');
            expect(result).toContain('![[fig4.png|fig:1.1.1.2]]');
            expect(result).toContain('![[fig5.png|fig:1.2.1]]');
        });

        test('should handle figures before any heading in absolute mode', () => {
            const content = `![[pre1.png]]
![[pre2.png]]

# First Heading
![[first.png]]

![[second.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Absolute, 6, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[pre1.png|fig:P1]]');
            expect(result).toContain('![[pre2.png|fig:P2]]');
            expect(result).toContain('![[first.png|fig:1.1]]');
            expect(result).toContain('![[second.png|fig:1.2]]');
        });

        test('should handle complex heading structure in absolute mode', () => {
            const content = `# Main
![[img1.png]]

## Section A
![[img2.png]]

### Sub A1
![[img3.png]]

## Section B
![[img4.png]]

# Another Main
![[img5.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Absolute, 6, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[img1.png|fig:1.1]]');
            expect(result).toContain('![[img2.png|fig:1.1.1]]');
            expect(result).toContain('![[img3.png|fig:1.1.1.1]]');
            expect(result).toContain('![[img4.png|fig:1.2.1]]');
            expect(result).toContain('![[img5.png|fig:2.1]]');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty content', () => {
            const result = runAutoNumberFig('', AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;
            expect(result).toBe('');
        });

        test('should handle content with no images', () => {
            const content = `# Chapter 1

Some text here.

## Section A

More text.`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;
            expect(result).toBe(content);
        });

        test('should handle images in code blocks (should be ignored)', () => {
            const content = `![[img1.png]]

\`\`\`
![[ignored.png]]
\`\`\`

# Chapter 1
![[img2.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[img1.png|fig:P1]]');
            expect(result).toContain('![[ignored.png]]');
            expect(result).not.toContain('![[ignored.png|fig:');
            expect(result).toContain('![[img2.png|fig:1.1]]');
        });

        test('should handle mixed WikiLink and Markdown images', () => {
            const content = `# Chapter 1

![[wiki.png]]

![](markdown.png)

![[wiki2.png|400]]

![300](markdown2.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[wiki.png|fig:1.1]]');
            expect(result).toContain('![fig:1.2](markdown.png)');
            expect(result).toContain('![[wiki2.png|fig:1.3|400]]');
            expect(result).toContain('![fig:1.4|300](markdown2.png)');
        });

        test('should handle different citation prefix', () => {
            const content = `# Chapter 1

![[img1.png]]

![[img2.png|image:old]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'image:').md;

            expect(result).toContain('![[img1.png|image:1.1]]');
            expect(result).toContain('![[img2.png|image:1.2]]');
            expect(result).not.toContain('image:old');
        });

        test('should handle complex metadata combination', () => {
            const content = `# Chapter 1

![[image.png|title:Title|desc:Description|fig:old|500]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image.png|title:Title|desc:Description|fig:1.1|500]]');
            expect(result).not.toContain('fig:old');
        });

        test('should preserve other metadata that is not title, desc, or tag', () => {
            const content = `# Chapter 1

![[image.png|custom:value|another:data]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:').md;

            expect(result).toContain('![[image.png|custom:value|another:data|fig:1.1]]');
        });
    });

    describe('enableTaggedOnly Mode', () => {
        test('should only number images with existing tags when enableTaggedOnly is true', () => {
            const content = `# Chapter 1

![[img1.png]]

![[img2.png|fig:old]]

![[img3.png]]

![[img4.png|fig:another]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:', false, true).md;

            // Images without tags should not be numbered
            expect(result).toContain('![[img1.png]]');
            expect(result).toContain('![[img3.png]]');
            
            // Images with tags should be renumbered
            expect(result).toContain('![[img2.png|fig:1.1]]');
            expect(result).toContain('![[img4.png|fig:1.2]]');
            
            // Old tags should be removed
            expect(result).not.toContain('fig:old');
            expect(result).not.toContain('fig:another');
        });

        test('should number all images when enableTaggedOnly is false', () => {
            const content = `# Chapter 1

![[img1.png]]

![[img2.png|fig:old]]

![[img3.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:', false, false).md;

            expect(result).toContain('![[img1.png|fig:1.1]]');
            expect(result).toContain('![[img2.png|fig:1.2]]');
            expect(result).toContain('![[img3.png|fig:1.3]]');
            expect(result).not.toContain('fig:old');
        });

        test('should handle enableTaggedOnly with markdown format', () => {
            const content = `# Chapter 1

![](img1.png)

![fig:old](img2.png)

![](img3.png)`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:', false, true).md;

            // Untagged should remain untagged
            expect(result).toContain('![](img1.png)');
            expect(result).toContain('![](img3.png)');
            
            // Tagged should be renumbered
            expect(result).toContain('![fig:1.1](img2.png)');
            expect(result).not.toContain('fig:old');
        });

        test('should handle enableTaggedOnly before any heading', () => {
            const content = `![[img1.png]]

![[img2.png|fig:old]]

# Chapter 1

![[img3.png|fig:another]]

![[img4.png]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:', false, true).md;

            expect(result).toContain('![[img1.png]]');
            expect(result).toContain('![[img2.png|fig:P1]]');
            expect(result).toContain('![[img3.png|fig:1.1]]');
            expect(result).toContain('![[img4.png]]');
        });
    });

    describe('Tag Mapping', () => {
        test('should return correct tag mapping for updated tags', () => {
            const content = `# Chapter 1

![[img1.png|fig:oldTag1]]

![[img2.png|fig:oldTag2]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:');

            expect(result.tagMapping.get('oldTag1')).toBe('1.1');
            expect(result.tagMapping.get('oldTag2')).toBe('1.2');
        });

        test('should not include untagged images in tag mapping', () => {
            const content = `# Chapter 1

![[img1.png]]

![[img2.png|fig:oldTag]]`;

            const result = runAutoNumberFig(content, AutoNumberingType.Relative, 7, '.', 'P', '', 'fig:');

            expect(result.tagMapping.has('1.1')).toBe(false);
            expect(result.tagMapping.get('oldTag')).toBe('1.2');
        });
    });
});
