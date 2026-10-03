"use client";

import { styled } from "styled-components";

export const AccentText = styled.span`
  color: var(--accent);
  font-weight: var(--font-weight-bold);
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  margin: 2rem auto;
  max-width: 480px;
`;

export const MainHeading = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, var(--accent), var(--accent-9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

export const MainSubtext = styled.p`
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

export const Button = styled.button`
  background-color: var(--accent);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--card-box-shadow-color);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--accent-hover);
  }
`;
