import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

// Selection item for menus
export interface SelectItem<T = string> {
  label: string;
  value: T;
  description?: string;
  color?: string;
}

interface SelectProps<T> {
  items: SelectItem<T>[];
  onSelect: (value: T) => void;
  title?: string;
  initialIndex?: number;
}

export function Select<T>({ items, onSelect, title, initialIndex = 0 }: SelectProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    }
    if (key.return) {
      onSelect(items[selectedIndex].value);
    }
    // Number shortcuts
    const num = parseInt(input);
    if (num >= 1 && num <= items.length) {
      setSelectedIndex(num - 1);
      onSelect(items[num - 1].value);
    }
  });

  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">{title}</Text>
        </Box>
      )}
      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={String(item.value)}>
            <Text color={isSelected ? "cyan" : "gray"}>
              {isSelected ? ">" : " "}
            </Text>
            <Text color={isSelected ? (item.color || "white") : "gray"} bold={isSelected}>
              {index + 1}. {item.label}
            </Text>
            {item.description && isSelected && (
              <Text color="gray"> - {item.description}</Text>
            )}
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>Use arrows or numbers to select, Enter to confirm</Text>
      </Box>
    </Box>
  );
}

// Text input component
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  title?: string;
}

export function TextInput({ value, onChange, onSubmit, placeholder, title }: TextInputProps) {
  useInput((input, key) => {
    if (key.return) {
      if (value.trim()) {
        onSubmit(value.trim().toUpperCase());
      }
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      // Only allow alphanumeric for ticker symbols
      if (/^[a-zA-Z0-9]$/.test(input)) {
        onChange(value + input.toUpperCase());
      }
    }
  });

  return (
    <Box flexDirection="column">
      {title && (
        <Box marginBottom={1}>
          <Text bold color="cyan">{title}</Text>
        </Box>
      )}
      <Box>
        <Text color="gray">{"> "}</Text>
        <Text color="white" bold>{value || ""}</Text>
        <Text color="cyan">_</Text>
        {!value && placeholder && (
          <Text color="gray"> {placeholder}</Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Type ticker symbol, Enter to confirm</Text>
      </Box>
    </Box>
  );
}

// Confirmation component
interface ConfirmProps {
  message: string;
  onConfirm: (confirmed: boolean) => void;
}

export function Confirm({ message, onConfirm }: ConfirmProps) {
  const [selected, setSelected] = useState(true);

  useInput((input, key) => {
    if (key.leftArrow || key.rightArrow || input === "y" || input === "n") {
      if (input === "y") {
        onConfirm(true);
        return;
      }
      if (input === "n") {
        onConfirm(false);
        return;
      }
      setSelected(!selected);
    }
    if (key.return) {
      onConfirm(selected);
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">{message}</Text>
      </Box>
      <Box gap={2}>
        <Text color={selected ? "green" : "gray"} bold={selected}>
          {selected ? "[Yes]" : " Yes "}
        </Text>
        <Text color={!selected ? "red" : "gray"} bold={!selected}>
          {!selected ? "[No]" : " No "}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Use arrows or Y/N, Enter to confirm</Text>
      </Box>
    </Box>
  );
}

// Logo/header component
export function Logo() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="magenta" bold>
          {`
  ██╗      █████╗ ████████╗████████╗██╗ ██████╗███████╗
  ██║     ██╔══██╗╚══██╔══╝╚══██╔══╝██║██╔════╝██╔════╝
  ██║     ███████║   ██║      ██║   ██║██║     █████╗
  ██║     ██╔══██║   ██║      ██║   ██║██║     ██╔══╝
  ███████╗██║  ██║   ██║      ██║   ██║╚██████╗███████╗
  ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝ ╚═════╝╚══════╝`}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">AI-powered stock analysis through mental models</Text>
      </Box>
    </Box>
  );
}

// Summary box for showing current selections
interface SummaryProps {
  items: Array<{ label: string; value: string; color?: string }>;
}

export function Summary({ items }: SummaryProps) {
  return (
    <Box
      borderStyle="round"
      borderColor="gray"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      marginY={1}
    >
      {items.map((item) => (
        <Box key={item.label}>
          <Text color="gray">{item.label}: </Text>
          <Text color={item.color || "white"} bold>{item.value}</Text>
        </Box>
      ))}
    </Box>
  );
}
