// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import type {ReactNode} from 'react';
import React, {memo, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import type {UserProfile} from '@mattermost/types/users';

import {Client4} from 'mattermost-redux/client';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {ChannelHeaderDropdown} from 'components/channel_header_dropdown';
import ProfilePicture from 'components/profile_picture';
import SharedChannelIndicator from 'components/shared_channel_indicator';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import BotTag from 'components/widgets/tag/bot_tag';

import {Constants} from 'utils/constants';

import ChannelHeaderTitleDirect from './channel_header_title_direct';
import ChannelHeaderTitleFavorite from './channel_header_title_favorite';
import ChannelHeaderTitleGroup from './channel_header_title_group';

type Props = {
    dmUser?: UserProfile;
    gmMembers?: UserProfile[];
}

const ChannelHeaderTitle = ({
    dmUser,
    gmMembers,
}: Props) => {
    const [titleMenuOpen, setTitleMenuOpen] = useState(false);
    const intl = useIntl();
    const channel = useSelector(getCurrentChannel);

    if (!channel) {
        return null;
    }

    const isDirect = (channel.type === Constants.DM_CHANNEL);
    const isGroup = (channel.type === Constants.GM_CHANNEL);
    const channelIsArchived = channel.delete_at !== 0;

    let archivedIcon: React.ReactNode = null;
    if (channelIsArchived) {
        archivedIcon = <ArchiveIcon className='icon icon__archive icon channel-header-archived-icon svg-text-color'/>;
    }

    let sharedIcon = null;
    if (channel.shared) {
        sharedIcon = (
            <SharedChannelIndicator
                className='shared-channel-icon'
                channelType={channel.type}
                withTooltip={true}
            />
        );
    }

    let channelTitle: ReactNode = channel.display_name;
    if (isDirect) {
        channelTitle = <ChannelHeaderTitleDirect dmUser={dmUser}/>;
    } else if (isGroup) {
        channelTitle = <ChannelHeaderTitleGroup gmMembers={gmMembers}/>;
    }

    if (isDirect && dmUser?.is_bot) {
        return (
            <div
                id='channelHeaderDropdownButton'
                className='channel-header__bot'
            >
                <ChannelHeaderTitleFavorite/>
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(dmUser.id, dmUser.last_picture_update)}
                    size='sm'
                />
                <strong
                    role='heading'
                    aria-level={2}
                    id='channelHeaderTitle'
                    className='heading'
                >
                    <span>
                        {archivedIcon}
                        {channelTitle}
                    </span>
                </strong>
                <BotTag/>
            </div>
        );
    }
    return (
        <div className='channel-header__top'>
            <ChannelHeaderTitleFavorite/>
            {isDirect && dmUser && ( // Check if it's a DM and dmUser is provided
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(dmUser.id, dmUser.last_picture_update)}
                    size='sm'
                    status={channel.status}
                />
            )}
            <MenuWrapper onToggle={setTitleMenuOpen}>
                <div
                    id='channelHeaderDropdownButton'
                >
                    <button
                        className={classNames('channel-header__trigger style--none', {active: titleMenuOpen})}
                        aria-label={intl.formatMessage({id: 'channel_header.menuAriaLabel', defaultMessage: 'Channel Menu'}).toLowerCase()}
                    >
                        <strong
                            role='heading'
                            aria-level={2}
                            id='channelHeaderTitle'
                            className='heading'
                        >
                            <span>
                                {archivedIcon}
                                {channelTitle}
                                {sharedIcon}
                            </span>
                        </strong>
                        <span
                            id='channelHeaderDropdownIcon'
                            className='icon icon-chevron-down header-dropdown-chevron-icon'
                        />
                    </button>
                </div>
                <ChannelHeaderDropdown/>
            </MenuWrapper>
        </div>
    );
};

export default memo(ChannelHeaderTitle);
