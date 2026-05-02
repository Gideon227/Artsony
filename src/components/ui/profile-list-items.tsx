'use client';

import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { ChevronDownIcon, DoubleChevronRightIcon } from './svg-icons';
import { cn } from '@/lib/utils'; // A utility to merge class names

// 1. Defining the precise 5 variants that map to the SVG states
export type ProfileListItemVariant = 
  | 'default_user'  // State 1: Avatar + Title
  | 'context_user'  // State 2: Avatar + Dropdown icon
  | 'action_user'   // State 3: Avatar + Action icon
  | 'default_group' // State 4: Avatar + Title + Dropdown icon
  | 'detailed_user' // State 5: Avatar + Title + Subtitle

interface ProfileListItemProps {
  variant: ProfileListItemVariant;
  avatarSrc?: string; // Optional custom avatar
  title?: string;     // Default 'Username' for user, 'Group' for group
  subtitle?: string;  // For detailed_user variant, e.g., 'Art Focus'
  className?: string;
}

// Standard height and padding based on typical design system spacing
const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 64px;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-sizing: border-box;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 16px; // Critical spacing after avatar
`;

// Holds all primary content that follows the avatar
const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1; // Fills available space
  min-width: 0; // Ensures text truncation works on long text
`;

// Vertical stack for title and optional subtitle
const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
`;

// Primary text (Title): font weight 500 (medium)
const Title = styled.p`
  margin: 0;
  font-family: Inter, sans-serif; // Modern sans-serif
  font-weight: 500;
  font-size: 1rem; // 16px
  color: #212529; // Standard dark gray text
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // Scalable handling for long titles
`;

// Secondary text (Subtitle): font weight 400 (light), smaller
const Subtitle = styled.p`
  margin: 0;
  margin-top: 2px; // Precise spacing
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 0.875rem; // 14px
  color: #868e96; // Standard lighter gray subtitle text
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// far right area, with push to right
const ActionGroup = styled.div`
  margin-left: auto; // Pushes icons to far right
  display: flex;
  align-items: center;
  gap: 8px; // Spacing for possible multiple actions
  color: #212529; // Action icons inherit standard text color
  flex-shrink: 0;
`;

export function ProfileListItem({
  variant,
  avatarSrc = "/images/sample-avatar.svg", // Local sample avatar asset
  title = "Username", // Default title value as per design
  subtitle,
  className,
}: ProfileListItemProps) {
  
  // Logic to determine initial title based on variant
  const finalTitle = variant === 'default_group' ? 'Group' : title;
  const hasSubtitle = variant === 'detailed_user' && subtitle;
  const showText = variant !== 'context_user' && variant !== 'action_user';

  return (
    <Container className={className}>
      
      {/* 1. Left Avatar */}
      <AvatarWrapper>
        <Image
          src={avatarSrc}
          alt={finalTitle}
          fill
          className="object-cover"
          sizes="48px"
        />
      </AvatarWrapper>

      {/* 2. Middle Content: Text or Contextual Icon */}
      <ContentContainer>
        {showText ? (
          <TextBlock>
            <Title title={finalTitle}>{finalTitle}</Title>
            {hasSubtitle && <Subtitle title={subtitle}>{subtitle}</Subtitle>}
          </TextBlock>
        ) : null}
      </ContentContainer>

      {/* 3. Right Action Area */}
      <ActionGroup>
        {variant === 'context_user' && <ChevronDownIcon className="w-5 h-5" />}
        {variant === 'default_group' && <ChevronDownIcon className="w-5 h-5 ml-4" />} {/* Position after text */}
        {variant === 'action_user' && <DoubleChevronRightIcon className="w-5 h-5" />}
      </ActionGroup>
      
    </Container>
  );
}