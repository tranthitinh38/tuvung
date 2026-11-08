import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import AdminChart from '../src/components/AdminChart';

describe('Phase 4 Enhancements', () => {
  it('electron-builder configuration exists and is valid', () => {
    const configPath = path.resolve(process.cwd(), 'electron-builder.yml');
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('productName: VOCABWORLD AI');
    expect(content).toContain('appId: com.vocabworld.ai');
  });

  it('AdminChart renders canvas element successfully', () => {
    const { container } = render(<AdminChart />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });
});
