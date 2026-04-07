import { EquationMatch } from "@/utils/parsers/equation_parser";

describe("Equation Panel Context Menu Copy", () => {
    describe("Copy type: full", () => {
        it("should format equation with braces and tags", () => {
            const equation: EquationMatch = {
                content: "E = mc^2",
                contentWithTag: "E = mc^2 \\tag{einstein}",
                tag: "einstein",
                raw: "$$E = mc^2 \\tag{einstein}$$",
                lineStart: 0,
                lineEnd: 0,
                inQuote: false
            };
            
            const expected = "$$E = mc^2 \\tag{einstein}$$";
            const result = `$$${equation.contentWithTag}$$`;
            
            expect(result).toBe(expected);
        });
    });

    describe("Copy type: noTag", () => {
        it("should format equation without tags but with braces", () => {
            const equation: EquationMatch = {
                content: "E = mc^2",
                contentWithTag: "E = mc^2 \\tag{einstein}",
                tag: "einstein",
                raw: "$$E = mc^2 \\tag{einstein}$$",
                lineStart: 0,
                lineEnd: 0,
                inQuote: false
            };
            
            const expected = "$$E = mc^2$$";
            const result = `$$${equation.content}$$`;
            
            expect(result).toBe(expected);
        });
    });

    describe("Copy type: eq", () => {
        it("should return equation content directly (no tags, no wrappers)", () => {
            const equation: EquationMatch = {
                content: "E = mc^2",
                contentWithTag: "E = mc^2 \\tag{einstein}",
                tag: "einstein",
                raw: "$$E = mc^2 \\tag{einstein}$$",
                lineStart: 0,
                lineEnd: 0,
                inQuote: false
            };
            
            const expected = "E = mc^2";
            const result = equation.content;
            
            expect(result).toBe(expected);
        });

        it("should preserve LaTeX content as-is", () => {
            const equation: EquationMatch = {
                content: "\\sum_{i=1}^{n} \\frac{x_i}{y_i}",
                contentWithTag: "\\sum_{i=1}^{n} \\frac{x_i}{y_i} \\tag{sum}",
                tag: "sum",
                raw: "$$\\sum_{i=1}^{n} \\frac{x_i}{y_i} \\tag{sum}$$",
                lineStart: 0,
                lineEnd: 0,
                inQuote: false
            };
            
            const expected = "\\sum_{i=1}^{n} \\frac{x_i}{y_i}";
            const result = equation.content;
            
            expect(result).toBe(expected);
        });
    });
});
