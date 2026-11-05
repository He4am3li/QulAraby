import React from 'react';
import { SaudiLayeredAvatar, type SaudiAvatarProps } from './SaudiLayeredAvatar';

/** Uses Salman facial artwork from the approved layered source on the new body pose. */
export const SalmanLayeredAvatar: React.FC<SaudiAvatarProps> = props => <SaudiLayeredAvatar {...props} actor="salman" />;
