// Source Chooser Plugin
(function($) {

	$.extend(mejs.MepDefaults, {
		sourcechooserText: 'Source Chooser'
	});

	$.extend(MediaElementPlayer.prototype, {
		buildsourcechooser: function(player, controls, layers, media) {

			var t = this;
			var enable_plugin = false;

			for (var i in this.node.children) {
				var src = this.node.children[i];
				if (src.nodeName === 'SOURCE' && src.dataset.res != undefined && src.dataset.res !== '' && (media.canPlayType(src.type) == 'probably' || media.canPlayType(src.type) == 'maybe')) {
					var enable_plugin = true;
				}
			}

			if ( enable_plugin == true ) {

				player.sourcechooserButton =
					$('<div class="mejs-button mejs-sourcechooser-button">'+
						'<button type="button" aria-controls="' + t.id + '" title="' + t.options.sourcechooserText + '" aria-label="' + t.options.sourcechooserText + '"></button>'+
						'<div class="mejs-menu-arrow">'+
						'<div class="mejs-sourcechooser-selector">'+
							'<span>'+kgvidL10n_frontend.quality+'</span>'+
							'<ul>'+
							'</ul>'+
						'</div>'+
						'</div>'+
					'</div>')
						.appendTo(controls)

						// hover
						.hover(function() {
							$(this).find('.mejs-menu-arrow').show();
						}, function() {
							$(this).find('.mejs-menu-arrow').hide();
						})

						// handle clicks to the source radio buttons
						.delegate('li', 'click', function() {

							player.changeRes(this.innerHTML);

						});

				// add to list
				player.availableRes = new Object();
				for (var i in this.node.children) {
					var src = this.node.children[i];
					if (src.nodeName === 'SOURCE' && src.dataset.res != undefined && src.dataset.res !== '' && (media.canPlayType(src.type) == 'probably' || media.canPlayType(src.type) == 'maybe')) {
						player.addSourceButton(src.src, src.dataset.res, src.type, media.src == src.src);
						player.availableRes[src.dataset.res] = src.src;

						if ( src.dataset.default_res != undefined ) {
							if ( this.currentRes != src.dataset.res ) {
								this.changeRes(src.dataset.res);
							}
						}

					}
				}

			}

		},

		addSourceButton: function(src, label, type, isCurrent) {
			var t = this;
			if (label === '' || label == undefined) {
				label = src;
			}
			type = type.split('/')[1];

			t.sourcechooserButton.find('ul').append(
				$('<li' + (isCurrent ? ' class="mejs-sourcechooser-selected"' : '') + ' name="' + t.id + '_sourcechooser" id="' + t.id + '_sourcechooser_' + label + type + '" >'+
					label+
				'</li>')
			);

		},

		getCurrentRes: function() {

			if ( typeof this.currentRes !== 'undefined' ) {

				return this.currentRes;

			} else {

				try {

					return res = this.node.children[0].dataset.res;

				} catch(e) {

					return '';
				}
			}
		},

		changeRes: function(target_res) {

			var media = this.media;
			var src = this.availableRes[target_res];

			if (media.currentSrc != src) {
				var currentTime = media.currentTime;
				var paused = media.paused;
				media.pause();
				media.setSrc(src);
				this.currentRes = target_res;
				jQuery(this.sourcechooserButton).find('li').removeClass('mejs-sourcechooser-selected');
				jQuery(this.sourcechooserButton).find('li:contains('+target_res+')').addClass('mejs-sourcechooser-selected');

				media.addEventListener('loadedmetadata', function(e) {
					media.currentTime = currentTime;
				}, true);

				var canPlayAfterSourceSwitchHandler = function(e) {
					if (!paused) {
						media.play();
					}
					media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler, true);
				};
				media.addEventListener('canplay', canPlayAfterSourceSwitchHandler, true);
				media.load();

			}

		}

	});

})(mejs.$);
