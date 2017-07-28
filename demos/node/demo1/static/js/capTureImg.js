//--获取视频缩略图--
			function vload(obj) {
				$(obj).removeAttr("poster");
				var vimg = $("<img/>",{width:"100%"})[0];
				captureImage(obj, vimg);
				$(obj).after(vimg);
				obj.remove();
				minigrid('.page-hot .container', '.photo');
			};
			var scale = 0.8; //缩放
			function captureImage(video, output) { //截图 
				try {
					var videocanvas = $("<canvas/>")[0];
					videocanvas.width = video.videoWidth * scale;
					videocanvas.height = video.videoHeight * scale;
					videocanvas.getContext('2d').drawImage(video, 0, 0, videocanvas.width, videocanvas.height);
					output.src = videocanvas.toDataURL("image/png");
					delete videocanvas;
					return true;
				} catch(e) {
					output.src = "/static/img/status.gif";
					return false;
				}
				return false;

			};