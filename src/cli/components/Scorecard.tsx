import React from "react";
import { Box, Text } from "ink";
import type { ModelAnalysis, Grade } from "../../data/types.js";

interface ScorecardProps {
  analyses: ModelAnalysis[];
  ticker: string;
}

function getGradeColor(grade: Grade): string {
  if (grade.startsWith("A")) return "green";
  if (grade.startsWith("B")) return "greenBright";
  if (grade.startsWith("C")) return "yellow";
  if (grade.startsWith("D")) return "redBright";
  return "red"; // F
}

function getGradeBackground(grade: Grade): string | undefined {
  if (grade === "A+" || grade === "A") return "green";
  if (grade === "F") return "red";
  return undefined;
}

export function Scorecard({ analyses, ticker }: ScorecardProps) {
  // Calculate average grade
  const gradeValues: Record<Grade, number> = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0
  };

  const avgGradeValue = analyses.reduce((sum, a) => sum + gradeValues[a.grade], 0) / analyses.length;

  // Convert back to letter grade
  let avgGrade: Grade = "C";
  if (avgGradeValue >= 4.15) avgGrade = "A+";
  else if (avgGradeValue >= 3.85) avgGrade = "A";
  else if (avgGradeValue >= 3.5) avgGrade = "A-";
  else if (avgGradeValue >= 3.15) avgGrade = "B+";
  else if (avgGradeValue >= 2.85) avgGrade = "B";
  else if (avgGradeValue >= 2.5) avgGrade = "B-";
  else if (avgGradeValue >= 2.15) avgGrade = "C+";
  else if (avgGradeValue >= 1.85) avgGrade = "C";
  else if (avgGradeValue >= 1.5) avgGrade = "C-";
  else if (avgGradeValue >= 1.15) avgGrade = "D+";
  else if (avgGradeValue >= 0.85) avgGrade = "D";
  else if (avgGradeValue >= 0.5) avgGrade = "D-";
  else avgGrade = "F";

  // Count grades by category
  const gradeCounts = analyses.reduce((acc, a) => {
    const cat = a.grade[0];
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header with overall grade */}
      <Box marginBottom={1} gap={2}>
        <Text bold>Summary Scorecard</Text>
        <Box>
          <Text dimColor>Overall: </Text>
          <Text bold color={getGradeColor(avgGrade)} backgroundColor={getGradeBackground(avgGrade)}>
            {" "}{avgGrade}{" "}
          </Text>
        </Box>
        <Box gap={1}>
          <Text dimColor>(</Text>
          {gradeCounts["A"] && <Text color="green">{gradeCounts["A"]}A</Text>}
          {gradeCounts["B"] && <Text color="greenBright">{gradeCounts["B"]}B</Text>}
          {gradeCounts["C"] && <Text color="yellow">{gradeCounts["C"]}C</Text>}
          {gradeCounts["D"] && <Text color="redBright">{gradeCounts["D"]}D</Text>}
          {gradeCounts["F"] && <Text color="red">{gradeCounts["F"]}F</Text>}
          <Text dimColor>)</Text>
        </Box>
      </Box>

      {/* Table header */}
      <Box>
        <Box width={28}>
          <Text bold dimColor>Mental Model</Text>
        </Box>
        <Box width={7}>
          <Text bold dimColor>Grade</Text>
        </Box>
        <Box>
          <Text bold dimColor>Notes</Text>
        </Box>
      </Box>

      {/* Divider */}
      <Text dimColor>{"─".repeat(70)}</Text>

      {/* Table rows */}
      {analyses.map((a, i) => (
        <Box key={i}>
          <Box width={28}>
            <Text>{a.modelName.length > 26 ? a.modelName.slice(0, 25) + "…" : a.modelName}</Text>
          </Box>
          <Box width={7}>
            <Text bold color={getGradeColor(a.grade)}>{a.grade}</Text>
          </Box>
          <Box>
            <Text dimColor>{a.gradeNote}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
