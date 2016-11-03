(function(window) {
	if (typeof Object.create !== 'function') {
		Object.create = function(obj) {
			function F() {};
			F.prototype = obj;
			return new F();
		};
	}
	window.FlashTang = window.FlashTang || {};
	window.FlashTang.PG = window.FlashTang.PG || {};
	window.FlashTang.PG.loadImage = function(imgURL, onLoad, passData) {
		var image = new Image();
		image.passData = passData;
		image.onload = onLoad;
		image.src = imgURL;
	}
})(window); 


(function($, window, document, undefined) {
	var _self_;
	var Gallery = {
		currentDownMC: null,
		currentShowMC: null,
		queueDownMC: null,
		photoPressAble: true,
		queueClickMC: null,
		stageIsDown: false,
		isTween: false,
		minSpace: 10,
		minSpaceX2: null,
		stageWidth: undefined,
		stageHeight: undefined,
		massSpace: 140,
		desTextArr: null,
		des_isFading: false,
		isBusy: false,
		memoryDes: undefined,
		desBgRimY: 6,
		desBgRimX: 8,
		desSpaceX: 200,
		desSpaceY: 8,
		init: function(options, elem) {
			_self_ = this;
			this.MID = 0;
			this.memoryCID = 0;
			this.cataPhotosArr = [];
			this.ftArr = [];
			this.bgUID = $.fn.FTPolaroidGallery.bgUID++;
			this.qUID = $.fn.FTPolaroidGallery.qUID++;
			this.minSpaceX2 = this.minSpace * 2;
			var self = this;
			self.el = elem;
			self.$el = $(elem);
			this.options = $.extend({},
			$.fn.FTPolaroidGallery.options, options);
			var sizeArr = this.options.size.split("x");
			this.stageWidth = Number(sizeArr[0]);
			this.stageHeight = Number(sizeArr[1]);
			$(elem).css({
				width: this.stageWidth + "px",
				height: this.stageHeight + "px",
				position: "relative"
			});
			var imgSrc = null;
			var totalGalleriesNum = self.$el.children('.cata').length;
			this.galleriesArr = [];
			this.cataTitlesArr = [];
			this.desSpaceX = Math.floor(this.stageWidth / 8);
			for (var j = 0; j < totalGalleriesNum; j++) {
				var totalPhotosNum = self.$el.children('.cata').eq(j).children('.pg_photo').length;
				this.gArr = [];
				this["desTextArr" + j] = []
				 for (var i = 0; i < totalPhotosNum; i++) {
					var div_eqi = self.$el.children('.cata').eq(j).children('.pg_photo').eq(i);
					var pgdes = div_eqi.find("#pg_des");
					var wwiidd=self.stageWidth - self.desSpaceX * 2;
					pgdes.css({
						width:wwiidd
					});
					this["desTextArr" + j].push(pgdes);
				 
					var imgSrc = div_eqi.data("image");
					var imgSrcSplitArr = imgSrc.split(".");
					this.gArr.push({
						thumb: imgSrcSplitArr[imgSrcSplitArr.length - 2] + "_th." + imgSrcSplitArr[imgSrcSplitArr.length - 1],
						src: imgSrc,
						title: div_eqi.data("title")
					});
				}
				this.cataTitlesArr.push(self.$el.children('.cata').eq(j).data("name"));
				this.galleriesArr.push({
					gArr: this.gArr,
					cataTh: self.$el.children('.cata').eq(j).data("cataimage")
				});
			}
			var canvas_className = "cvs_KKJHKJHNCCC44" + $.fn.FTPolaroidGallery.G;
			var _____id = "gallery_" + (++$.fn.FTPolaroidGallery.G);
			self.$el.prepend('<canvas style="display:none;" class=' + canvas_className + ' id="' + _____id + '"' + '></canvas>');
			self.$el.prepend('<div id="' + 'bgcd4017' + this.bgUID + '"' + '><p></p></div>');
			this.desTextBg = $("#bgcd4017" + this.bgUID);
			this.desTextBg.css({
				'position': 'absolute',
				'pointer-events': 'none',
				'border-top': 'solid 1px #555555',
				'border-left': 'solid 1px #555555',
				'border-right': 'solid 1px #000000',
				'border-bottom': 'solid 1px #000000',
				'display': 'none'
			})
			 this.canvas = document.getElementById("gallery_" + $.fn.FTPolaroidGallery.G);
			if (!this.canvas.getContext) {
				var swf_c_id = "fallback" + ($.fn.FTPolaroidGallery.G2++);
				self.$el.prepend('<div id="' + swf_c_id + '"></div>');
				var flashvars = {
					galleriesArr: this.galleriesArr,
					backgroundImage: this.options.backgroundImage,
					fps: this.options.fps,
					BGM_volume: this.options.BGM_volume,
					fallBackData: this.options.fallBackData,
					cataThumbSize: this.options.cataThumbSize,
					rimWidth: this.options.rimWidth,
					rimBottomHeight: this.options.rimBottomHeight,
					autoPlayDelay: this.options.autoPlayDelay,
					BGM: this.options.BGM,
					cataThumbGrid: this.options.cataThumbGrid
				};
				var params = {
					quality: "high",
					scale: "noscale",
					salign: "tl",
					wmode: "window",
					bgcolor: "#222222",
					devicefont: "false",
					allowfullscreen: "true",
					allowscriptaccess: "always"
				}
				var swfURL = "PolaroidGallery/fallback/PolaroidGallery.swf";
				swfobject.embedSWF(swfURL, swf_c_id, this.stageWidth, this.stageHeight, "9.0.0", "expressInstall.swf", flashvars, params, {});
				return this;
			}
			this.canvas.onselectstart = function() {
				return false;
			}
			$("#" + _____id).show();
			this.canvas.width = this.stageWidth;
			this.canvas.height = this.stageHeight;
			this.doUpdate = true;
			this.stage = new Stage(this.canvas);
			this.bg = new Container();
			this.stage.addChild(this.bg);
			this.allPcmc = new Container();
			this.stage.addChild(this.allPcmc);
			this.pCmcArr = [];
			this.touchAble = Touch.isSupported();
			this.touchAble && Touch.enable(this.stage);
			this.stage.enableMouseOver(10);
			Ticker.addListener(this);
			Ticker.setFPS(this.options.FPS || this.options.fps);
			this.loadImage(this.options.backgroundImage, this.bgImgLoaded, {
				self: this
			});
			if (this.options.describe_bg_color) {
				this.desTextBg.css({
					"background-color": this.options.describe_bg_color
				});
			}
			this.topBarCmc = new Container();
			this.topBarBgCmc = new Container();
			this.topBarCmc.addChild(this.topBarBgCmc);
			this.stage.addChild(this.topBarCmc);
			this.loadImage("PolaroidGallery/bi-imgs/topBarBg.png", this.onTopBarBgLoaded, {
				self: this
			});
			this.loadImage("PolaroidGallery/bi-imgs/preloader.png", this.preloaderPngLoaded, {
				self: this
			});
			this.preloaderCmc = new Container();
			this.preloaderCmc.visible = false;
			this.stage.addChild(this.preloaderCmc);
			var thSizeArr = this.options.cataThumbSize.split("x");
			this.cataThumWid = Number(thSizeArr[0]);
			this.cataThumHei = Number(thSizeArr[1]);
			var thGridArr = this.options.cataThumbGrid.split("x");
			this.cataThumbGrid_H = Number(thGridArr[0]);
			this.cataThumbGrid_v = Number(thGridArr[1]);
			this.cataThumSpace = 2;
			this.cataThumFrameRimX = 60;
			this.cataThumFrameRimY = 60;
			this.topText = new Text();
			this.topText.text = this.cataTitlesArr[0];
			this.topText.color = "#999999";
			this.topText.font = "16px Arial";
			this.topText.textBaseline = "middle";
			this.topText.x = 136;
			this.topText.y = 21;
			this.topBarCmc.addChild(this.topText);
			this.btnsCMC = new Container();
			this.topBarCmc.addChild(this.btnsCMC);
			this.topBarCmc.y = -50;
			var btnSizeObj = {
				startX: 4,
				startY: 4,
				width: 32,
				height: 32
			}
			var cataBtn = new FlashTang.PG.SimpleButton({
				self: this
			});
			cataBtn.onIconsLoaded = function(target_sb) {};
			cataBtn.create(["cata_up.png", "cata_over.png", "cata_down.png"], {
				startX: 4,
				startY: 4,
				width: 122,
				height: 32
			});
			this.btnsCMC.addChild(cataBtn.cmc);
			cataBtn.cmc.y = 2;
			cataBtn.cmc.x = 2;
			cataBtn.onPress = function() {
				self.cs.show();
				$(self.canvas).css('cursor', 'auto');
			}
			if (this.options.BGM) {
				var musicBtn = new FlashTang.PG.SimpleButton({
					self: this
				});
				musicBtn.onIconsLoaded = function(target_sb) {};
				musicBtn.create(["music_up.png", "music_over.png", "music_down.png"], btnSizeObj);
				this.btnsCMC.addChild(musicBtn.cmc);
				musicBtn.cmc.y = 2;
				musicBtn.cmc.x = this.stageWidth - 8 - 30;
				var musicBtnX = new FlashTang.PG.SimpleButton({
					self: this
				});
				musicBtnX.onIconsLoaded = function(target_sb) {};
				musicBtnX.create(["music-x_up.png", "music-x_over.png", "music-x_down.png"], btnSizeObj);
				this.btnsCMC.addChild(musicBtnX.cmc);
				musicBtnX.cmc.y = 2;
				musicBtnX.cmc.x = this.stageWidth - 8 - 30;
				musicBtnX.cmc.visible = false;
			}
			var playBtn = new FlashTang.PG.SimpleButton({
				self: this
			});
			playBtn.onIconsLoaded = function(target_sb) {};
			playBtn.create(["play_up.png", "play_over.png", "play_down.png"], btnSizeObj);
			this.btnsCMC.addChild(playBtn.cmc);
			playBtn.cmc.y = 2;
			playBtn.cmc.x = this.stageWidth - 8 - (30 + 4) * (this.options.BGM ? 2: 1);
			var pauseBtn = new FlashTang.PG.SimpleButton({
				self: this
			});
			pauseBtn.onIconsLoaded = function(target_sb) {};
			pauseBtn.create(["pause_up.png", "pause_over.png", "pause_down.png"], btnSizeObj);
			this.btnsCMC.addChild(pauseBtn.cmc);
			pauseBtn.cmc.y = 2;
			pauseBtn.cmc.x = this.stageWidth - 8 - (30 + 4) * 2;
			pauseBtn.cmc.visible = false;
			this.autoPlay = false;
			playBtn.onClick = function() {
				pauseBtn.cmc.visible = true;
				playBtn.cmc.visible = false;
				self.startPlay(self.options.autoPlayDelay);
			}
			pauseBtn.onClick = function() {
				pauseBtn.cmc.visible = false;
				playBtn.cmc.visible = true;
				self.stopPlay();
			}
			this.pauseBtn = pauseBtn;
			this.playBtn = playBtn;
			this.cataBlackBG = this.drawRect(0, 0, 1, 1, "#000000");
			this.cataBlackBG.visible = false;
			this.cataBlackBG.alpha = 0.4;
			this.cataBlackBG.scaleX = this.stageWidth;
			this.cataBlackBG.scaleY = this.stageHeight;
			this.stage.addChild(this.cataBlackBG);
			this.cataBlackBG.onPress = function() {
				return false
			};
			var w = -this.cataThumSpace + (this.cataThumSpace + this.cataThumWid) * this.cataThumbGrid_H + (this.cataThumFrameRimX * 2);
			var h = this.cataThumFrameRimY * 2 + this.cataThumHei;
			this.cs = new FlashTang.PG.CataSelector({
				width: w,
				height: h,
				fw: 6,
				frameColor: "#ffffff",
				bgColor: "#000000",
				self: this,
				frameAlpha: 0.8,
				bgAlpha: 0.8
			});
			this.cs.cmc.visible = false;
			this.cs.cmc.x = this.stageWidth;
			this.stage.addChild(this.cs.cmc);
			this.cs.cmc.x = (this.stageWidth - this.cs.width) * .5;
			this.cs.cmc.y = (this.stageHeight - this.cs.height) * .5;
			this.cs.loadCataThumb(this.galleriesArr, this.cataTitlesArr);
			this.disableCover = this.drawRect(0, 0, this.stageWidth, this.stageHeight, "#000000", 0);
			this.disableCover.alpha = 0.01;
			this.disableCover.visible = false;
			this.stage.addChild(this.disableCover);
			this.disableCover.onPress = function() {
				return false
			};
			this.isPlayMusic = false;
			var agent = navigator.userAgent.toLowerCase();
			var isIOS = ((agent.indexOf("ipad") > -1) || (agent.indexOf("iphone") > -1));
			if (this.options.BGM_autoPlay && !isIOS) {
				this.playSound(this.options.BGM);
				musicBtnX.cmc.visible = false;
				musicBtn.cmc.visible = true;
				this.isPlayMusic = true
			}
			 else {
				musicBtnX.cmc.visible = true;
				musicBtn.cmc.visible = false;
			}
			musicBtnX.onClick = function() {
				if (!_self_.musicLoaded) {
					self.playSound(self.options.BGM);
				}
				 else {
					var v = Number(_self_.options.BGM_volume);
					try {
						SoundJS.play("bgm", null, v, true);
					} catch(e) {}
				}
				musicBtnX.cmc.visible = false;
				musicBtn.cmc.visible = true;
			}
			musicBtn.onClick = function() {
				self.stopMusic();
				musicBtnX.cmc.visible = true;
				musicBtn.cmc.visible = false;
			}
			return this;
		},
		playSound: function(snd) {
			var filetype;
			var agent = navigator.userAgent.toLowerCase();
			if (agent.indexOf("chrome") > -1) {
				filetype = ".mp3";
			} else if (agent.indexOf("opera") > -1) {
				filetype = ".ogg";
			} else if (agent.indexOf("firefox") > -1) {
				filetype = ".ogg";
			} else if (agent.indexOf("safari") > -1) {
				filetype = ".mp3";
			} else if (agent.indexOf("msie") > -1) {
				filetype = ".mp3";
			}
			SoundJS.onLoadQueueComplete = this.doneSndLoading;
			SoundJS.addBatch([{
				name: "bgm",
				src: snd + filetype,
				instances: 1
			}]);
		},
		stopMusic: function() {
			SoundJS.stop();
		},
		doneSndLoading: function() {
			_self_.musicLoaded = true;
			var v = Number(_self_.options.BGM_volume)
			 try {
				SoundJS.play("bgm", null, v, true);
			} catch(e) {}
		},
		startPlay: function(delay) {
			var self = this;
			if (this.autoID) {
				clearInterval(this.autoID);
			}
			this.autoPlay = true;
			this.autoID = setInterval(function() {
				var oldShowID = self.MID - 1;
				if (self.MID == (self["cataPhotosArr" + self.memoryCID].length)) {
					self.MID = 0;
					oldShowID = self["cataPhotosArr" + self.memoryCID].length - 1;
				}
				if (self.currentShowMC) {
					self.hideCurrentPic(self["cataPhotosArr" + self.memoryCID][oldShowID].cmc, 800,
					function() {
						self.showPicByID(self.memoryCID, self.MID - 1);
					});
				}
				 else {
					self.showPicByID(self.memoryCID, self.MID);
				}
				self.MID++
			},
			delay);
		},
		stopPlay: function() {
			if (this.autoID) {
				clearInterval(this.autoID);
				this.pauseBtn.cmc.visible = false;
				this.playBtn.cmc.visible = true;
				this.autoPlay = false;
			}
		},
		next: function() {},
		prev: function() {},
		showPicByID: function(gid, pid) {
			var pic = this["cataPhotosArr" + gid][pid];
			this.showPic(pic.cmc, 800,
			function() {})
		},
		showPic: function(pic, time, cb) {
			var target = pic
			var self = this;
			target.parent.addChild(target);
			self.currentShowMC = target;
			var minSpace = self.minSpace;
			var minSpaceX2 = self.minSpaceX2;
			var targetScale;
			var targetHei;
			var targetWid;
			var desBgHei = target.self["desTextArr" + self.memoryCID][target.id].height() + target.self.desBgRimY * 2;
			var topBarHei = 40;
			var desBottomSpace = self.desSpaceY;
			var jianQu = desBgHei + (topBarHei > 0 ? (topBarHei + desBottomSpace) : 0);
			var maxWid = target.oriWid * ((self.stageHeight - self.minSpaceX2 - jianQu) / target.oriHei);
			if (maxWid > self.stageWidth - self.minSpaceX2) {
				targetScale = (self.stageWidth - self.minSpaceX2) / target.oriWid;
			}
			 else {
				targetScale = (self.stageHeight - self.minSpaceX2 - jianQu) / target.oriHei;
			}
			Tween.get(target, {
				loop: false,
				override: true
			},
			true).to({
				x: self.stageWidth * .5,
				y: (self.stageHeight - self.minSpaceX2 - jianQu) * .5 + topBarHei + minSpace,
				rotation: 0,
				scaleX: targetScale,
				scaleY: targetScale
			},
			time, Ease.cubicInOut).call(function() {
				target.photo.isBigState = true;
				target.self.photoPressAble = true;
				target.parent.addChild(target);
				target.self.showDesByID(target.id);
				if (!target.photo.BigImageLoadCompleted) {
					target.photo.loadBigImage();
					self.preloaderCmc.x = target.x;
					self.preloaderCmc.y = target.y;
				} else {
					if (target.photo.big) {
						target.photo.big.visible = true;
						target.photo.big.alpha = 0;
						Tween.get(target.photo.big, {
							loop: false,
							override: true
						},
						true).to({
							alpha: 1
						},
						500, Ease.cubicInOut).call(function() {
							target.photo.imgBM.visible = false;
						});
					}
				}
				self.isBusy = false;
				cb && cb();
			});
			self.isBusy = true;
		},
		hideCurrentPic: function(tar, time, cb) {
			var self = this;
			var target = tar;
			target.oldTargetX = Math.random() * (self.stageWidth - self.massSpace * 2) + self.massSpace;
			target.oldTargetY = Math.random() * (self.stageHeight - self.massSpace * 2) + self.massSpace;
			Tween.get(self.currentShowMC, {
				loop: false,
				override: true
			},
			true).to({
				x: self.currentShowMC.oldTargetX,
				y: self.currentShowMC.oldTargetY,
				rotation: self.currentShowMC.targetRotation,
				scaleX: 1,
				scaleY: 1
			},
			time, Ease.cubicInOut).call(function() {
				self.currentShowMC = null;
				self.photoPressAble = true;
				if (target.photo.big) {
					target.photo.big.visible = false;
					target.photo.imgBM.visible = true;
				}
				cb && cb();
			});
			self.hideOldDes(function() {
				self.memoryDes.hide();
				self.memoryDes = null;
				self.isBusy = false;
			});
			self.photoPressAble = false;
			self.isBusy = true;
			self.preloaderCmc.visible = false;
			target.photo.isBigState = false;
		},
		preloaderPngLoaded: function(e) {
			var preImg = e.target;
			var self = e.target.passData.self;
			var preloaderBM = new Bitmap(preImg);
			self.preloaderCmc.addChild(preloaderBM);
			preloaderBM.regX = 12;
			preloaderBM.regY = 12;
		},
		drawRect: function(p1, p2, p3, p4, clr, round, sd) {
			var s = new Shape();
			if (round) {
				s.graphics.beginFill(clr).drawRoundRect(p1, p2, p3, p4, round).endFill();
			}
			 else {
				s.graphics.beginFill(clr).drawRect(p1, p2, p3, p4).endFill();
			}
			s.width = p3;
			s.height = p4;
			if (sd) {
				s.shadow = sd;
			}
			return s;
		},
		drawFrame: function(w, h, fw, clr) {
			var s = new Shape();
			s.graphics.beginFill(clr).moveTo(0, 0).lineTo(w, 0).lineTo(w, fw).lineTo(fw, fw).lineTo(fw, h - fw).lineTo(w - fw, h - fw).lineTo(w - fw, fw).lineTo(w, fw).lineTo(w, h).lineTo(0, h).lineTo(0, 0);
			return s;
		},
		onTopBarBgLoaded: function(e) {
			var topBarBgImage = e.target;
			var self = e.target.passData.self;
			var topBarBgBM = new Bitmap(topBarBgImage);
			topBarBgBM.scaleX = self.stageWidth / 10;
			self.topBarBgCmc.addChild(topBarBgBM);
			self.stage.update();
		},
		showDesByID: function(desID) {
			var _des = this["desTextArr" + this.memoryCID][desID];
			this.currentDes = _des;
			if (!this.memoryDes) {
				this.showDesByIDDo();
				this.memoryDes = _des;
			}
			 else {
				this.hideOldDes(function() {
					self.des_isFading = true;
					self.showDesByIDDo();
					this.memoryDes = null;
				});
				this.memoryDes = _des;
			}
			return {
				goSide: "bottom",
				height: 0
			};
		},
		showDesByIDDo: function() {
			var f_time = 500;
			var __wid = this.currentDes.width(),
			__hei = this.currentDes.height();
			var rim_x = this.desBgRimX,
			rim_y = this.desBgRimY;
			var sw = this.canvas.width,
			sh = this.canvas.height;
			var bg_tar_hei = __hei + rim_y * 2,
			bg_y = sh - bg_tar_hei - this.desSpaceY;
			this.desTextBg.css({
				opacity: "0",
				left: "0px",
				top: bg_y + "px",
				width: __wid + rim_x * 2,
				height: bg_tar_hei
			});
			var bg_tar_x = (sw - __wid - rim_x * 2) * .5;
			this.desTextBg.show().stop().animate({
				left: bg_tar_x + "px",
				opacity: this.options.describe_bg_alpha
			},
			f_time, 'swing',
			function() {});
			var des_txt_ori_x = rim_x
			var des_txt_tar_x = bg_tar_x + rim_x;
			this.currentDes.show().stop().css({
				opacity: "0",
				top: bg_y + rim_y
			}).animate({
				left: des_txt_tar_x + "px",
				opacity: "1"
			},
			f_time, 'swing',
			function() {});
		},
		hideOldDes: function(onComplete) {
			var f_time = 300;
			var self = this;
			this.desTextBg.show().stop().animate({
				left: 0 + "px",
				opacity: "0"
			},
			f_time, 'swing',
			function() {});
			this.memoryDes.show().stop().animate({
				left: "0px",
				opacity: "0"
			},
			f_time, 'swing', onComplete);
		},
		loadImage: window.FlashTang.PG.loadImage,
		tick: function() {
			this.stage.update();
			this.preloaderCmc.rotation += 10;
		},
		bgImgLoaded: function(e) {
			var image = e.target;
			var self = image.passData.self;
			var bitmap = new Bitmap(image);
			bitmap.scaleX = self.stageWidth / image.width;
			bitmap.scaleY = self.stageHeight / image.height;
			self.bg.addChild(bitmap)
			 self.stage.update();
			self.loadPhotos(self.galleriesArr, 0);
			Tween.get(self.topBarCmc, {
				loop: false,
				override: true
			},
			true).wait(800).to({
				y: 0
			},
			700, Ease.cubicInOut)
		},
		blurPhtos: function() {
			var bbf = new BoxBlurFilter(2, 2, 2);
			var margins = bbf.getBounds();
			this.pCmc.filters = [bbf];
			this.pCmc.cache(0, 0, this.stageWidth, this.stageHeight);
		},
		zoomOutPhoto: function(photo_cmc, obj) {
			if (!photo_cmc) {
				return;
			}
			var self = this;
			Tween.get(photo_cmc, {
				loop: false,
				override: true
			},
			true).to({
				x: self.currentShowMC.oldTargetX,
				y: self.currentShowMC.oldTargetY,
				rotation: self.currentShowMC.targetRotation,
				scaleX: 1,
				scaleY: 1
			},
			500, Ease.cubicInOut).call(function() {
				self.currentShowMC = null;
				self.photoPressAble = true;
				if (photo_cmc.photo.big) {
					photo_cmc.photo.big.visible = false;
					photo_cmc.photo.imgBM.visible = true;
				}
				if (obj.shooCID != undefined) {
					self.shooPhotosByCID({
						cid: obj.shooCID
					});
				}
			});
			self.hideOldDes(function() {
				self.memoryDes.hide();
				self.memoryDes = null;
				self.isBusy = false;
			});
			self.photoPressAble = false;
			self.isBusy = true;
			self.preloaderCmc.visible = false;
			photo_cmc.photo.isBigState = false;
		},
		shooPhotosByCID: function(obj) {
			this.CSID = 0;
			this.stopPlay();
			var shooCID = obj.cid;
			var arr = this["cataPhotosArr" + obj.cid];
			var self = this;
			for (var i = 0; i < arr.length; i++) {
				if (i == 0) {
					Tween.get(arr[i].cmc, {
						loop: false,
						override: true
					},
					true).wait(1200).to({
						x: self.stageWidth + 300,
						y: arr[i].cmc.y
					},
					1000, Ease.cubicInOut).call(function() {
						self["pCmc" + shooCID].visible = false;
						self.disableCover.visible = false;
						self.loadPhotos(self.galleriesArr, self.memoryCID);
						self["pCmc" + self.memoryCID].visible = true;
					});
				} else {
					Tween.get(arr[i].cmc, {
						loop: false,
						override: true
					},
					true).wait(Math.random() * 1000 + 200).to({
						x: self.stageWidth + 300,
						y: arr[i].cmc.y
					},
					1000, Ease.cubicInOut);
				}
			}
		},
		convenePhotosByCID: function(cid) {
			var arr = this["cataPhotosArr" + cid];
			var self = this;
			for (var i = 0; i < arr.length; i++) {
				var cmc = arr[i].cmc
				var targetX = Math.random() * (self.stageWidth - self.massSpace * 2) + self.massSpace;
				var targetY = Math.random() * (self.stageHeight - self.massSpace * 2) + self.massSpace;
				var rn1 = Math.random();
				var rn2 = Math.random();
				var initX = -arr[i].width * 1.2,
				initY = -arr[i].height * 1.2;
				cmc.x = initX;
				cmc.y = initY;
				cmc.oldTargetX = targetX;
				cmc.oldTargetY = targetY;
				var targetRotation = Math.random() * 45 - 45 / 2;
				cmc.targetRotation = targetRotation;
				Tween.get(cmc, {
					loop: false,
					override: true
				},
				true).wait(Math.random() * 1000).to({
					x: targetX,
					y: targetY,
					rotation: targetRotation
				},
				1000, Ease.cubicInOut).call(function() {});
			}
		},
		loadPhotos: function(galleriesArr, cataNum) {
			if (!this["pCmc" + cataNum]) {
				this["pCmc" + cataNum] = new Container();
				this.allPcmc.addChild(this["pCmc" + cataNum]);
				this["cataPhotosArr" + cataNum] = [];
			}
			 else {
				this.convenePhotosByCID(cataNum);
				return;
			}
			this.memoryCID = cataNum;
			var objArr = galleriesArr[cataNum].gArr;
			var self = this;
			for (var j = 0; j < objArr.length; j++) {
				this["cataPhotosArr" + cataNum].push(null);
			}
			for (var j = 0; j < objArr.length; j++) {
				this.loadImage(objArr[j].thumb,
				function(e) {
					var image = e.target;
					var pd = image.passData;
					var p = new FlashTang.PG.Photo({
						picWid: image.width,
						picHei: image.height,
						rim: self.options.rimWidth,
						BH: self.options.rimBottomHeight,
						rimColor: "#FFFFFF",
						id: image.passData.id,
						rim_radius: self.options.rim_radius,
						self: self,
						bigImgURL: image.passData.bigImgURL
					})
					 p.addImage(image);
					p.addTo(pd._tar_parent);
					p.setTitle({
						text: objArr[image.passData.id].title,
						font: "12px Voces",
						color: "#666666"
					})
					 var targetX = Math.random() * (self.stageWidth - self.massSpace * 2) + self.massSpace;
					var targetY = Math.random() * (self.stageHeight - self.massSpace * 2) + self.massSpace;
					var rn1 = Math.random();
					var rn2 = Math.random();
					var initX = -image.width * 1.2,
					initY = -image.height * 1.2;
					p.cmc.x = initX;
					p.cmc.y = initY;
					p.cmc.oldTargetX = targetX;
					p.cmc.oldTargetY = targetY;
					var targetRotation = Math.random() * 45 - 45 / 2;
					p.cmc.targetRotation = targetRotation;
					if (pd.self.memoryCID == pd.cataNum) {
						Tween.get(p.cmc, {
							loop: false,
							override: true
						},
						true).wait(Math.random() * 1000).to({
							x: targetX,
							y: targetY,
							rotation: targetRotation
						},
						1000, Ease.cubicInOut)
					}
					pd.self["cataPhotosArr" + cataNum][pd.id] = p;
					p.cmc.self = self;
					p.cmc.oriWid = p.width;
					p.cmc.oriHei = p.height; (function(target) {
						p.cmc.onPress = function(evt) {
							if (target.self.photoPressAble && target.self.currentShowMC == null) {
								target.self.moveStep = 0;
								var offset = {
									x: target.x - evt.stageX,
									y: target.y - evt.stageY
								};
								target.parent.addChild(target);
								evt.onMouseMove = function(ev) {
									if (target.self.currentShowMC == null) {
										target.x = ev.stageX + offset.x;
										target.y = ev.stageY + offset.y;
										target.self.moveStep++;
										if (target.self.moveStep == 2) {
											target.self.stopPlay();
											target.self.photoPressAble = true;
											if (target.scaleX < 1.1) {
												Tween.get(target, {
													loop: false,
													override: true
												},
												true).to({
													scaleX: 1.1,
													scaleY: 1.1
												},
												120, Ease.cubicInOut);
											}
										}
									}
								}
								target.self.photoPressAble = false;
							}
						};
						p.cmc.onClick = function() {
							var self = target.self;
							if (self.currentShowMC == null && target.self.moveStep >= 2) {
								target.self.stopPlay();
								Tween.get(target, {
									loop: false,
									override: true
								},
								true).to({
									scaleX: 1,
									scaleY: 1
								},
								200, Ease.cubicInOut);
							}
							if (self.currentShowMC == target && !self.isBusy) {
								target.self.stopPlay();
								self.hideCurrentPic(target, 800,
								function() {});
							}
							 else if (self.currentShowMC == null && target.self.moveStep < 2 && !self.isBusy) {
								self.MID = target.id;
								target.self.stopPlay();
								self.showPic(target, 800);
							}
						}
					})(p.cmc);
				},
				{
					self: this,
					id: j,
					bigImgURL: objArr[j].src,
					_tar_parent: this["pCmc" + cataNum],
					cataNum: cataNum
				});
			}
		}
	}
	$.fn.FTPolaroidGallery = function(options) {
		return this.each(function() {
			var gallery = Object.create(Gallery);
			gallery.init(options, this);
			$.fn.FTPolaroidGallery.galleries.push(gallery);
		})
	};
	$.fn.FTPolaroidGallery.options = {
		fps: "30",
		canvas: "noname",
		width: undefined,
		height: undefined,
		backgroundImage: "bi-imgs/bg.jpg",
		rimWidth: 3,
		rimBottomHeight: 20,
		size: "800x600",
		describe_bg_color: "#000000",
		describe_bg_alpha: "0.6",
		show_des_on: "bottom",
		des_stage_space_y: 4,
		des_min_space_x: 20,
		rim_radius: 0,
		cataThumbSize: "160x130",
		cataThumbGrid: "3x1",
		autoPlayDelay: 8000,
		BGM: undefined,
		BGM_volume: 0.5,
		BGM_autoPlay: true,
		fallBackData: undefined
	}
	$.fn.FTPolaroidGallery.galleries = []
	 $.fn.FTPolaroidGallery.G = 0;
	$.fn.FTPolaroidGallery.G2 = 0;
	$.fn.FTPolaroidGallery.bgUID = 0;
	$.fn.FTPolaroidGallery.qUID = 0;
})(jQuery, window, document); 

(function($, window, document, undefined) {
	function Photo(paraObj) {
		this.self = paraObj.self;
		this.bigImageLoaded = false;
		this.rimColor = paraObj.rimColor;
		this.picWid = paraObj.picWid;
		this.picHei = paraObj.picHei;
		this.rim = paraObj.rim;
		this.paraObj = paraObj;
		this.bigImgURL = paraObj.bigImgURL;
		this.width = this.picWid + paraObj.rim * 2;
		this.height = this.picHei + this.rim + paraObj.BH;
		this.BH = paraObj.BH;
		this.cmc = new Container();
		this.cmc.regX = Math.floor(this.width * .5);
		this.cmc.regY = Math.floor(this.height * .5);
		this.rimMC = new Shape();
		this.rimMC.graphics.beginFill(paraObj.rimColor).setStrokeStyle(1, 1, 1).drawRoundRect(0, 0, this.width, this.height, paraObj.rim_radius).endFill();
		this.rimMC.shadow = new Shadow("#000000", 1, 1, 6);
		this.cmc.id = paraObj.id;
		this.cmc.addChild(this.rimMC);
		this.imgBM = null;
		this.cmc.photo = this;
	};
	Photo.prototype.setTitle = function(tObj) {
		if (!this.textMC) {
			this.textMC = new Text();
			this.cmc.addChild(this.textMC);
			this.textMC.y = this.height - Math.floor(this.BH / 2);
			this.textMC.x = this.rim;
		}
		this.textMC.text = tObj.text;
		this.textMC.color = tObj.color;
		this.textMC.font = tObj.font;
		this.textMC.textBaseline = "middle";
		this.textMC.lineWidth = this.width - this.rim * 2;
	}
	Photo.prototype.addTo = function(_tar) {
		_tar.addChild(this.cmc);
	};
	Photo.prototype.addImage = function(_img) {
		this.imgBM = new Bitmap(_img);
		this.imgBM.x = this.rim;
		this.imgBM.y = this.rim;
		this.cmc.addChild(this.imgBM);
	};
	Photo.prototype.loadBigImage = function() {
		if (!this.BigImageLoadCompleted) {
			this.self.preloaderCmc.visible = true;
		}
		if (!this.bigImageLoaded) {
			this.self.loadImage(this.bigImgURL,
			function(e) {
				var img = e.target;
				var photo = img.passData.photo;
				photo.big = new Bitmap(e.target);
				photo.big.visible = false;
				photo.big.x = photo.imgBM.x;
				photo.big.y = photo.imgBM.y;
				photo.big.scaleY = photo.big.scaleX = photo.paraObj.picWid / img.width;
				photo.cmc.addChild(photo.big);
				if (photo.self.currentShowMC === photo.cmc && photo.isBigState) {
					photo.big.visible = true;
					photo.big.alpha = 0;
					Tween.get(photo.big, {
						loop: false,
						override: true
					},
					true).to({
						alpha: 1
					},
					500, Ease.cubicInOut).call(function() {
						photo.imgBM.visible = false;
					});
					photo.self.preloaderCmc.visible = false;
				}
				photo.BigImageLoadCompleted = true;
			},
			{
				photo: this
			})
			 this.bigImageLoaded = true;
		}
	};
	window.FlashTang.PG.Photo = Photo;
})(jQuery, window, document); 


(function($, window, document, undefined) {
	var tis = Touch.isSupported();
	SimpleButton.prototype.iconsLoaded = 0;
	SimpleButton.prototype.iconsTotal = 0;
	SimpleButton.prototype.enabled = true;
	function SimpleButton(params) {
		this.self = params.self;
		this.cmc = new Container();
		return this;
	}
	SimpleButton.prototype.setEnable = function(ea) {
		this.enabled = ea;
		this.cmc.alpha = ea ? 1: 0.3;
	};
	SimpleButton.prototype.update = function(sta) {
		if (sta == "up") {
			if (this.memoryShowIcon) {
				this.memoryShowIcon.visible = false;
			}
			this.memoryShowIcon = this["c" + 0];
			this.memoryShowIcon.visible = true;
		}
		if (sta == "over") {
			if (this.memoryShowIcon) {
				this.memoryShowIcon.visible = false;
			}
			this.memoryShowIcon = this["c" + 1];
			this.memoryShowIcon.visible = true;
		}
		if (sta == "down") {
			if (this.memoryShowIcon) {
				this.memoryShowIcon.visible = false;
			}
			this.memoryShowIcon = this["c" + 2];
			this.memoryShowIcon.visible = true;
		}
	}
	SimpleButton.prototype.create = function(iconsURLArr, area) {
		this.width = area.width;
		this.height = area.height;
		this.area = area;
		this.iconsTotal = iconsURLArr.length;
		for (var i = 0; i < iconsURLArr.length; i++) {
			var icon_url = "PolaroidGallery/bi-imgs/buttons/" + iconsURLArr[i];
			var c = this["c" + i] = new Container();
			this.cmc.addChild(c);
			FlashTang.PG.loadImage(icon_url,
			function(e) {
				var img = e.target;
				var pd = e.target.passData;
				pd.c.addChild(new Bitmap(img));
				pd.c.visible = false;
				if (++pd.SB.iconsLoaded == pd.SB.iconsTotal) {
					pd.SB.onIconsLoaded && pd.SB.onIconsLoaded(pd.SB);
					pd.SB.rollMC.visible = true;
					pd.SB.rollMC.x = pd.SB.area.startX;
					pd.SB.rollMC.y = pd.SB.area.startY;
					if (pd.SB.area.width) {
						pd.SB.rollMC.scaleX = pd.SB.area.width;
					}
					 else {
						pd.SB.rollMC.scaleX = img.width;
					}
					if (pd.SB.area.width) {
						pd.SB.rollMC.scaleY = pd.SB.area.height;
					}
					 else {
						pd.SB.rollMC.scaleY = img.height;
					}
					pd.SB.update("up");
				}
			},
			{
				c: c,
				SB: this,
				id: i
			});
		};
		this.rollMC = new Shape();
		this.rollMC.graphics.beginFill("#ff0000").drawRect(0, 0, 1, 1).endFill();
		this.rollMC.alpha = 0.01;
		this.cmc.addChild(this.rollMC);
		var sb_self = this; (function(tar) {
			tar.onPress = function() {
				if (!tis) {
					sb_self.update("down");
				}
				sb_self.onPress && sb_self.onPress();
			}
			tar.onClick = function() {
				if (!tis) {
					$(sb_self.self.canvas).css("cursor", "pointer");
					sb_self.update("over");
				}
				sb_self.onClick && sb_self.onClick();
			}
			tar.onMouseOver = function() {
				if (!tis) {
					$(sb_self.self.canvas).css("cursor", "pointer");
					sb_self.update("over");
				}
			}
			tar.onMouseOut = function() {
				if (!tis) {
					$(sb_self.self.canvas).css("cursor", "auto");
					sb_self.update("up");
				}
			}
		})(this.rollMC);
		return this;
	};
	window.FlashTang.PG.SimpleButton = SimpleButton;
})(jQuery, window, document); 


(function($, window, document, undefined) {
	function FunThumb(__obj) {
		this.id = __obj.id;
		this.selected = false;
		this.headerBgHei = 24;
		this.obj = __obj;
		this.cmc = new Container();
		this.width = this.obj.width;
		this.height = this.obj.height;
		this.oriBg = this.obj.self.drawRect(0, 0, this.width, this.height, "#000000", 0);
		this.oriBg.alpha = 0.5;
		this.cmc.addChild(this.oriBg);
		this.bmCmc = new Container();
		this.cmc.addChild(this.bmCmc);
		this.headerMC = new Shape();
		this.headerCMC = new Container();
		this.headerBg = this.obj.self.drawRect(0, 0, this.obj.width, this.headerBgHei, "#000000", 0);
		this.headerBg.alpha = .6
		 this.headerCMC.addChild(this.headerBg)
		 this.titleText = new Text();
		this.titleText.textBaseline = "middle";
		this.titleText.y = this.headerBgHei * .5;
		this.titleText.x = 4;
		this.titleText.text = this.obj.title;
		this.titleText.color = "#ffffff"
		this.titleText.font = "12px Arial"
		this.titleText.lineWidth = this.width - 8;
		this.headerCMC.addChild(this.titleText);
		this.cmc.addChild(this.headerCMC);
		this.rimAndTextCMC = new Container();
		this.rimMC = this.obj.self.drawFrame(this.width, this.height, 4, "#FFFFFF");
		this.rimTextBg = this.obj.self.drawRect(0, 0, this.obj.width, this.headerBgHei, "#FFFFFF", 0);
		this.rimText = new Text();
		this.rimText.textBaseline = "middle";
		this.rimText.y = this.headerBgHei * .5;
		this.rimText.x = 4;
		this.rimText.text = this.obj.title;
		this.rimText.color = "#000000"
		this.rimText.font = "12px Arial"
		this.rimText.lineWidth = this.width - 8;
		this.rimAndTextCMC.addChild(this.rimTextBg);
		this.rimAndTextCMC.addChild(this.rimText);
		this.rimAndTextCMC.addChild(this.rimMC);
		this.rimAndTextCMC.alpha = 0;
		this.cmc.addChild(this.rimAndTextCMC);
		this.rollMC = this.obj.self.drawRect(0, 0, this.width, this.height, "#000000", 0);
		this.cmc.addChild(this.rollMC);
		this.rollMC.alpha = 0.01;
		var _this = this;
		this.rollMC.onMouseOver = function() {
			if (Touch.isSupported()) {
				return;
			}
			if (_this.obj.self.memorySelectCataThumb != _this) {
				$(_this.obj.self.canvas).css("cursor", "pointer");
			}
			if (!_this.selected) {
				_this.showRim();
			}
		}
		this.rollMC.onMouseOut = function() {
			if (Touch.isSupported()) {
				return;
			}
			$(_this.obj.self.canvas).css("cursor", "auto");
			if (!_this.selected) {
				_this.hideRim();
			}
		}
		this.rollMC.onPress = function() {
			_this.obj.self.mu.x = _this.cmc.x + _this.obj.self.cataThumWid - 24;
			_this.onPress && _this.onPress({
				id: _this.id
			});
			_this.select(true);
			$(_this.obj.self.canvas).css("cursor", "auto");
		}
	}
	FunThumb.prototype.load = function() {
		FlashTang.PG.loadImage(this.obj.url,
		function(e) {
			var img = e.target;
			var pd = e.target.passData;
			var ft = pd.ft;
			var bm = new Bitmap(img);
			bm.scaleX = ft.obj.width / img.width;
			bm.scaleY = ft.obj.height / img.height;
			ft.bmCmc.addChild(bm);
			ft.oriBg.visible = false;
		},
		{
			ft: this,
			id: this.obj.id,
			self: this.obj.self
		});
	};
	FunThumb.prototype.showRim = function(_obj__) {
		var _this = this;
		var _obj_ = _obj__;
		_this.rimAndTextCMC.visible = true;
		_this.rimAndTextCMC.alpha = 0;
		Tween.get(_this.rimAndTextCMC, {
			loop: false,
			override: true
		},
		true).to({
			alpha: ((_obj_ == undefined) ? 1: _obj_.alpha)
		},
		((_obj_ == undefined) ? 200: _obj_.t), Ease.linear).call(function() {})
	}
	FunThumb.prototype.hideRim = function(_obj_) {
		var _this = this;
		Tween.get(_this.rimAndTextCMC, {
			loop: false,
			override: true
		},
		true).to({
			alpha: 0,
			visible: false
		},
		((_obj_ == undefined) ? 200: _obj_.t), Ease.linear).call(function() {});
	}
	FunThumb.prototype.select = function(_select) {
		if (_select) {
			if (this.obj.self.memorySelectCataThumb != this) {
				if (this.obj.self.memorySelectCataThumb) {
					this.obj.self.memorySelectCataThumb.select(false);
				}
				this.obj.self.memorySelectCataThumb = this;
			}
			this.selected = true;
			this.showRim({
				t: 0,
				alpha: 1
			})
		}
		 else {
			this.selected = false;
			this.hideRim();
		}
	};
	window.FlashTang.PG.FunThumb = FunThumb;
})(jQuery, window, document); 


(function($, window, document, undefined) {
	function CataSelector(obj) {
		this.flipAble = true;
		this.currentPage = 0;
		this.self = obj.self;
		this.cataBlackBG = obj.self.cataBlackBG
		 this.cmc = new Container();
		this.rimFrame = obj.self.drawFrame(obj.width, obj.height, obj.fw, obj.frameColor);
		this.rimFrame.alpha = obj.frameAlpha;
		this.bg = obj.self.drawRect(0, 0, obj.width - obj.fw * 2, obj.height - obj.fw * 2, obj.bgColor, 0);
		this.bg.x = obj.fw;
		this.bg.y = obj.fw;
		this.bg.alpha = obj.bgAlpha;
		this.width = obj.width;
		this.height = obj.height;
		this.cmc.addChild(this.rimFrame);
		this.cmc.addChild(this.bg);
		this.width = obj.width;
		this.height = obj.height;
		this.mu = new Container();
		this.mu.visible = false;
		this.cmc.addChild(this.mu);
		this.self.mu = this.mu;
		FlashTang.PG.loadImage("PolaroidGallery/bi-imgs/mu.png",
		function(e) {
			var img = e.target;
			var pd = e.target.passData;
			var bm = new Bitmap(img);
			pd.cs.mu.addChild(bm);
		},
		{
			cs: this
		});
		return this;
	}
	CataSelector.prototype.loadCataThumb = function(thURLArr, titleArr) {
		var _this = this;
		var cs = this;
		this.totalPagesNum = Math.ceil(thURLArr.length / this.self.cataThumbGrid_H)
		 for (var j = 0; j < thURLArr.length; j++) {
			var ft = new FlashTang.PG.FunThumb({
				width: this.self.cataThumWid,
				height: this.self.cataThumHei,
				url: thURLArr[j].cataTh,
				self: this.self,
				id: j,
				title: titleArr[j]
			});
			ft.id = j;
			ft.onPress = function(data) {
				if (!this.selected) {
					cs.self.stage.addChild(cs.self.disableCover);
					cs.self.disableCover.visible = true;
					cs.self.currentShowMC ? cs.self.zoomOutPhoto(cs.self.currentShowMC, {
						shooCID: cs.self.memoryCID
					}) : cs.self.shooPhotosByCID({
						cid: cs.self.memoryCID,
						delay: 0
					});
					cs.self.memoryCID = this.id;
					cs.hide(400);
					cs.self.topText.text = cs.self.cataTitlesArr[this.id];
				}
			}
			this.self.ftArr.push(ft);
			ft.load();
			ft.cmc.x = (ft.width + this.self.cataThumSpace) * j + this.self.cataThumFrameRimX;
			ft.cmc.x -= Math.floor(j / this.self.cataThumbGrid_H) * (ft.width + this.self.cataThumSpace) * this.self.cataThumbGrid_H;
			ft.cmc.y = this.self.cataThumFrameRimY;
			this.cmc.addChild(ft.cmc);
			if (j == 0) {
				this.mu.x = ft.cmc.x + ft.width - 24;
				this.mu.y = ft.cmc.y + 6;
				this.mu.visible = true;
				this.mu.alpha = .6;
				ft.select(true);
			}
			if (j >= this.self.cataThumbGrid_H) {
				ft.cmc.visible = false;
			}
		}
		this.cmc.addChild(this.mu);
		this.cmc.addChild(this.maskCMC);
		this.leftArrow = new FlashTang.PG.SimpleButton({
			self: this.self
		});
		this.leftArrow.create(["left_up.png", "left_over.png", "left_down.png"], {
			startX: 0,
			startY: 0,
			width: 26,
			height: 52
		});
		this.leftArrow.cmc.y = (this.height - 48) * 0.5;
		this.leftArrow.cmc.x = (this.self.cataThumFrameRimX - this.leftArrow.width) * 0.5;
		this.cmc.addChild(this.leftArrow.cmc);
		this.rightArrow = new FlashTang.PG.SimpleButton({
			self: this.self
		});
		this.rightArrow.create(["right_up.png", "right_over.png", "right_down.png"], {
			startX: 0,
			startY: 0,
			width: 26,
			height: 52
		});
		this.rightArrow.cmc.y = (this.height - 48) * 0.5;
		this.rightArrow.cmc.x = this.width - this.self.cataThumFrameRimX + (this.self.cataThumFrameRimX - this.rightArrow.width) * .5;
		this.cmc.addChild(this.rightArrow.cmc);
		this.closeBtn = new FlashTang.PG.SimpleButton({
			self: this.self
		});
		this.closeBtn.create(["x_up.png", "x_over.png", "x_down.png"], {
			startX: 0,
			startY: 0,
			width: 32,
			height: 32
		});
		this.closeBtn.cmc.y = (this.self.cataThumFrameRimY - this.closeBtn.height) * .5 + 6;
		this.closeBtn.cmc.x = this.width - this.self.cataThumFrameRimX + (this.self.cataThumFrameRimX - this.closeBtn.width) * .5 - 6
		 this.cmc.addChild(this.closeBtn.cmc);
		this.closeBtn.onPress = function() {
			_this.hide();
			$(_this.self.canvas).css("cursor", "auto");
		}
		this.leftArrow.setEnable(false);
		this.leftArrow.onPress = function() {
			if (!_this.flipAble) {
				return
			}
			if (_this.currentPage > 0) {
				_this.currentPage--;
				_this.flipAble = false;
				_this.pageText.text = "PAGE " + (_this.currentPage + 1) + " OF " + _this.totalPagesNum;
				_this.rightArrow.setEnable(true);
				for (var i = 0; i < _this.self.cataThumbGrid_H; i++) {
					var old = _this.self.ftArr[((_this.currentPage + 1) * _this.self.cataThumbGrid_H + i)];
					if (!old) {
						break;
					}
					if (i == _this.self.cataThumbGrid_H) {
						Tween.get(old.cmc, {
							loop: false,
							override: true
						},
						true).wait(i * 50).to({
							alpha: 0,
							visible: false
						},
						100, Ease.linear);
					}
					 else {
						Tween.get(old.cmc, {
							loop: false,
							override: true
						},
						true).wait(i * 50).to({
							alpha: 0,
							visible: false
						},
						100, Ease.linear).call(function() {
							var last
							for (var k = 0; k < _this.self.cataThumbGrid_H; k++) {
								var now = _this.self.ftArr[((_this.currentPage) * _this.self.cataThumbGrid_H + k)];
								if (!now) {
									break;
								}
								last = now;
								now.cmc.alpha = 0;
								now.cmc.visible = true;
								Tween.get(now.cmc, {
									loop: false,
									override: true
								},
								true).wait(k * 50).to({
									alpha: 1
								},
								100, Ease.linear).call(function() {
									if (last.cmc == this) {
										_this.flipAble = true;
									}
								})
							};
						});
					}
				}
			}
		}
		this.rightArrow.onPress = function() {
			if (!_this.flipAble) {
				return
			}
			if (_this.currentPage < _this.totalPagesNum - 1) {
				_this.currentPage++;
				_this.flipAble = false;
				_this.leftArrow.setEnable(true);
				_this.pageText.text = "PAGE " + (_this.currentPage + 1) + " OF " + _this.totalPagesNum;
				for (var i = 0; i < _this.self.cataThumbGrid_H; i++) {
					var old = _this.self.ftArr[((_this.currentPage - 1) * _this.self.cataThumbGrid_H + i)];
					if (i == _this.self.cataThumbGrid_H) {
						Tween.get(old.cmc, {
							loop: false,
							override: true
						},
						true).wait(i * 50).to({
							alpha: 0,
							visible: false
						},
						100, Ease.linear)
					}
					 else {
						Tween.get(old.cmc, {
							loop: false,
							override: true
						},
						true).wait(i * 50).to({
							alpha: 0,
							visible: false
						},
						100, Ease.linear).call(function() {
							var last
							for (var k = 0; k < _this.self.cataThumbGrid_H; k++) {
								var now = _this.self.ftArr[((_this.currentPage) * _this.self.cataThumbGrid_H + k)];
								if (!now) {
									break;
								}
								last = now
								 now.cmc.alpha = 0;
								now.cmc.visible = true;
								Tween.get(now.cmc, {
									loop: false,
									override: true
								},
								true).wait(k * 50).to({
									alpha: 1
								},
								100, Ease.linear).call(function() {
									if (last.cmc == this) {
										_this.flipAble = true;
									}
								})
							};
						});
					}
				}
			}
		}
		this.pageText = new Text();
		this.pageText.text = "PAGE 1 OF 2";
		this.pageText.color = "#666666"
		this.pageText.font = "10px Arial";
		this.pageText.textBaseline = "middle";
		this.pageText.x = this.self.cataThumFrameRimX;
		this.pageText.y = this.self.cataThumFrameRimY * .5;
		this.cmc.addChild(this.pageText);
		if (thURLArr.length <= this.self.cataThumbGrid_H) {
			this.rightArrow.cmc.visible = this.leftArrow.cmc.visible = false;
		}
	}
	CataSelector.prototype.show = function(d) {
		var _this = this;
		_this.self.isPlayingWhenChangeCata = _this.self.autoPlay;
		_this.self.memoryCIDForAutoPlay = _this.self.memoryCID;
		_this.self.stopPlay();
		var delay = d ? d: 0;
		this.cataBlackBG.alpha = 0;
		this.cataBlackBG.visible = true;
		Tween.get(this.cataBlackBG, {
			loop: false,
			override: true
		},
		true).wait(delay).to({
			alpha: .8
		},
		500, Ease.cubicInOut).call(function() {});
		this.cmc.alpha = 0;
		this.cmc.x = this.self.stageWidth;
		this.cmc.visible = true;
		Tween.get(this.cmc, {
			loop: false,
			override: true
		},
		true).wait(200 + delay).to({
			alpha: 1,
			x: (this.self.stageWidth - this.width) * .5
		},
		700, Ease.cubicInOut).call(function() {});
	};
	CataSelector.prototype.hide = function(d) {
		var _this = this;
		var delay = d ? d: 0;
		this.cataBlackBG.visible = true;
		Tween.get(this.cataBlackBG, {
			loop: false,
			override: true
		},
		true).wait(500 + delay).to({
			alpha: .0,
			visible: false
		},
		300, Ease.cubicInOut).call(function() {
			if (_this.self.memoryCIDForAutoPlay == _this.self.memoryCID) {
				if (_this.self.isPlayingWhenChangeCata) {
					_this.self.playBtn.onClick();
				}
			}
			 else {
				_this.self.MID = 0;
			}
		});
		this.cmc.visible = true;
		Tween.get(this.cmc, {
			loop: false,
			override: true
		},
		true).wait(delay).to({
			alpha: 0,
			x: -this.width,
			visible: false
		},
		500, Ease.cubicInOut).call(function() {});
	};
	window.FlashTang.PG.CataSelector = CataSelector;
})(jQuery, window, document);