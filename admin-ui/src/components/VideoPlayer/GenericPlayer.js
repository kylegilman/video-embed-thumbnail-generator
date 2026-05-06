/**
 * A generic HTML5 video player component.
 */

import { forwardRef } from '@wordpress/element';

/**
 * GenericPlayer component.
 *
 * @param {Object}    props             Component props.
 * @param {string}    props.poster      URL for the video poster image.
 * @param {boolean}   props.loop        Whether the video should loop.
 * @param {boolean}   props.autoPlay    Whether the video should autoplay.
 * @param {string}    props.preload     Preload setting (auto, metadata, none).
 * @param {boolean}   props.controls    Whether to show video controls.
 * @param {boolean}   props.muted       Whether the video is muted.
 * @param {boolean}   props.playsInline Whether the video should play inline on mobile.
 * @param {string}    props.className   Additional CSS classes.
 * @param {Array}     props.sources     List of video source objects.
 * @param {string}    props.src         Primary video source URL.
 * @param {Array}     props.tracks      List of text track (label, src, kind, etc.) objects.
 * @param {React.Ref} ref               Reference to the video element.
 * @return {Element} The rendered component.
 */
const GenericPlayer = forwardRef(
	(
		{
			poster,
			loop,
			autoPlay,
			preload,
			controls,
			muted,
			playsInline,
			className,
			sources = [],
			src,
			tracks = [],
			onPlay,
			onPause,
			onEnded,
		},
		ref
	) => (
		<video
			onPlay={onPlay}
			onPause={onPause}
			onEnded={onEnded}
			poster={poster}
			loop={loop}
			autoPlay={autoPlay}
			preload={preload}
			controls={controls ? true : undefined}
			muted={muted}
			playsInline={playsInline}
			width="100%"
			height="100%"
			className={className}
			ref={ref}
		>
			{sources.map((source, index) => (
				<source key={index} src={source.src} type={source.type} />
			))}
			{tracks.map((track, index) => (
				<track
					key={index}
					src={track.src}
					kind={track.kind}
					srcLang={track.srclang}
					label={track.label}
					default={track.default}
				/>
			))}
			<a href={src}>{src}</a>
		</video>
	)
);

export default GenericPlayer;
