
/**
 * Select a portion of the timestamps given, so that *quantity* timestamps are chosen between
 * the given times (including the endpoints)
 * @param timestamps All timestamps, sorted
 * @param start_timestamp The smaller (start) timestamp
 * @param end_timestamp The larger (end) timestamp
 * @param quantity The total number of timestamps to provide
 */
export function timestampSelection(
	timestamps: number[],
	start_timestamp: number,
	end_timestamp: number,
	quantity: number
): number[] {
	if (timestamps.length === 0) {
		return []
	}
	const smallestTimestamp = start_timestamp;
	const largestTimestamp = end_timestamp;

	// Ideally, we want a number every *targetInterval* values (NOT indexes)
	const targetInterval = Math.floor((largestTimestamp - smallestTimestamp) / quantity);

	let output: number[] = [];
	let index = 0;
	let lastTimestamp: number | undefined;

	while (index < timestamps.length) {
		const curTimestamp = timestamps[index];
		if (curTimestamp < start_timestamp) {
			index++;
			continue;
		}
		if (curTimestamp > end_timestamp) {
			// The input is monotonically increasing
			return output;
		}
		if (!lastTimestamp || curTimestamp - lastTimestamp > targetInterval) {
			// We've gone past our target interval
			output.push(curTimestamp);
			lastTimestamp = curTimestamp;
		}
		index++;
	}

	// if (output.length > 0 && output[output.length - 1] != largestTimestamp) {
	// 	output[output.length - 1] = largestTimestamp
	// }


	return output;
}


export function debounceTimestamps(timestamps: string[], seconds: number): string[] {
	let sorted_filenames: string[] = timestamps
	sorted_filenames.sort();

	let last_datetime: number = -2 * (seconds);

	let filtered_filenames: string[] = sorted_filenames.filter((filename: string) => {
		const pathSegments: string[] = filename.split('/');
		const new_datetime = parseInt(pathSegments[pathSegments.length - 1]);
		const large_enough: boolean = new_datetime > (last_datetime + seconds);

		// Update last datetime state
		last_datetime = large_enough ? new_datetime : last_datetime;
		return large_enough;
	}, []);
	return filtered_filenames;
}

/**
 * Takes the first 4 numbers of a timestamp to create a folder.
 * Each folder holds about 12 days of data
 * Eg:
 * 1593986853 -> 07/05/2020 @ 10:07pm (UTC)
 * 1593986853 -> 06/24/2020 @ 8:20am (UTC)
 * @param timestamp Unix timestamp.
 */
export function timestampToFolder(timestamp: number): string {
	return timestamp.toString().substr(0, 4);
}