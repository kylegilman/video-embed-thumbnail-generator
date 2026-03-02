import { forwardRef } from '@wordpress/element';

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
			sources,
			src,
			tracks = [],
		},
		ref
	) => (
		<video
			poster={poster}
			loop={loop}
			autoPlay={autoPlay}
			preload={preload}
			controls={controls}
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
