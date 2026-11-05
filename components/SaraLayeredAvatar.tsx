import React from 'react';
import { SaudiLayeredAvatar, type SaudiAvatarProps } from './SaudiLayeredAvatar';

/** Keeps Sara's metal face covering fixed above the visible speech mouth. */
export const SaraLayeredAvatar: React.FC<SaudiAvatarProps> = props => <SaudiLayeredAvatar {...props} actor="sara" />;
