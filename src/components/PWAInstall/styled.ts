"use client";

import { styled } from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

export const MainHeading = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #1b5745, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const MainSubtext = styled.p`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 2rem;
`;

export const Button = styled.button`
  background-color: #1b5745;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #14523c;
  }
`;
