import Game from '@/models/Game';
import { Descriptions, Tag } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useMemo } from 'react';

export interface GameInfoProps {
	game: Game;
	currentTurn?: number;
}

export default function GameInfo({ game, currentTurn }: GameInfoProps) {
	const tag = useMemo(() => {
		if (currentTurn === undefined) return <Tag color='processing'>Waiting</Tag>;
		if (currentTurn >= game.num_of_turns) return <Tag color='error'>Finished</Tag>;
		return <Tag color='success'>Playing</Tag>;
	}, [game.num_of_turns, currentTurn]);

	return (
		<Descriptions bordered layout='vertical' column={2}>
			<DescriptionsItem label='Game Id'>{game.id}</DescriptionsItem>
			<DescriptionsItem label='Chiều map'>
				{game.field.width}x{game.field.height}
			</DescriptionsItem>
			<DescriptionsItem label='Thời gian mỗi lượt (s)'>{game.time_per_turn} secs</DescriptionsItem>
			<DescriptionsItem label='Tổng số lượt'>{game.num_of_turns}</DescriptionsItem>
			<DescriptionsItem label='Thời gian bắt đầu'>
				{dayjs(game.start_time).format('DD/MM/YYYY HH:mm:ss')}
			</DescriptionsItem>

			<DescriptionsItem label='Trạng thái'>{tag}</DescriptionsItem>
		</Descriptions>
	);
}
