"use strict";
//数据
var requester = getApp().global.requester;
var color = requester.color;
//图标
var requesterImg = getApp().global.requesterImg;
var tcanvasIcon = requesterImg.tcanvasIcon;
var Cropper = function (wx, ctx, canvasId) {//裁剪控件
    var self = this;
    self.wx = wx;
    self.ctx = ctx;
    self.canvasId = canvasId;
    self.needRedraw = false;//是否需要重绘
    self.Conf = {//配置
        sr: 0.015,//放缩系数
        rr: 1,//旋转角度系数
        mr: 1,//平移系数
        box: {//裁剪盒子配置
            width: "40%",//支持百分比(相对与canvas)和像素
            height: "40%"
        },
        sw: 0,//幕布宽度
        sh: 0 //幕布高度
    };
    self.Data = {//初始数据
        path: "",//图片路径
        cw: 0,	//canvas宽
        ch: 0,	//canvas高
        bw: 0,	//canvas-box宽
        bh: 0,	//canvas-box高
        bx: 0,	//canvas-box的x
        by: 0,	//canvas-box的y
        sw: 1,	//宽度缩放
        sh: 1,	//高度缩放
        osw: 1,	//上次宽度缩放
        osh: 1,	//上次高度缩放
        r: 0,	//旋转角度
        iow: 0,	//图片原始宽
        ioh: 0,	//图片原始高
        idw: 0,	//图片当前绘制宽
        idh: 0,	//图片当前绘制高
        idow: 0,//图片原始绘制宽
        idoh: 0,//图片原始绘制高
        idx: 0,	//图片当前绘制x
        idy: 0,	//图片当前绘制y
        idox: 0,//图片原始绘制x
        idoy: 0	//图片原始绘制y
    };
    self.ResData = {//结果数据
        path: "", x: 0, y: 0, width: 0, height: 0, rotate: 0, scaleX: 1, scaleY: 1, naturalWidth: 0, naturalHeight: 0
    };
    self.setConf = function (conf) {
        for (var k in conf) {
            self.Conf[k] = conf[k];
        }
    }
    self.setData = function (data) {
        for (var k in data) {
            self.Data[k] = data[k];
        }
    }

    self.getResData = function () {
        var nx = (self.Data.idx) + self.Data.idw / 2 ;
        var ny = (self.Data.idy) + self.Data.idh / 2 ;
        self.Data.idx -= self.Data.idw * (self.Data.sw - 1.0) / 2.0;
        self.Data.idy -= self.Data.idh * (self.Data.sh - 1.0) / 2.0;
        //计算结果
        //console.info(" nx="+nx+"& ny="+ny);
        //console.info("onx="+self.Data.onx+"&ony="+self.Data.ony);
        //console.info("iox="+self.Data.idox+"&ioy="+self.Data.idoy);

        if (self.Data.r % 180 == 0) {//正常 180 & 0
            self.Data.x = self.Data.onx - nx + self.Data.idw * self.Data.sw /2 - self.Data.bw/2;
            self.Data.y = self.Data.ony - ny + self.Data.idh * self.Data.sh /2 - self.Data.bh/2;
        }else if (self.Data.r % 90 == 0) {//90 & 270
            self.Data.x = self.Data.onx - nx + self.Data.idh * self.Data.sw /2 - self.Data.bw/2;
            self.Data.y = self.Data.ony - ny + self.Data.idw * self.Data.sh /2 - self.Data.bh/2;
        } else {
            self.Data.x = self.Data.onx - nx + self.Data.idw * self.Data.sw /2 - self.Data.bw/2;
            self.Data.y = self.Data.ony - ny + self.Data.idh * self.Data.sh /2 - self.Data.bh/2;
        }
        /*if (self.Data.r % 180 == 0) {//正常 180 & 0
            self.Data.x = self.Data.bx - self.Data.idx;
            self.Data.y = self.Data.by - self.Data.idy;
            //self.Data.x = self.Data.bx - self.Data.idx + (self.Data.idw - self.Data.idow) / 2;
            //self.Data.y = self.Data.by - self.Data.idy + (self.Data.idh - self.Data.idoh) / 2;
        } else if (self.Data.r % 90 == 0) {//90 & 270
            //self.Data.x = self.Data.bx - (self.Data.idoy + (nx-self.Data.onx));
            //self.Data.y = self.Data.by - (self.Data.idox + (ny-self.Data.ony));
            self.Data.x = self.Data.onx - nx + self.Data.idh * self.Data.sw /2 - self.Data.bw/2;
            self.Data.y = self.Data.ony - ny + self.Data.idw * self.Data.sh /2 - self.Data.bh/2;
            /!*self.Data.y = self.Data.bx - self.Data.idx;
            self.Data.x = self.Data.by - self.Data.idy;*!/
            //self.Data.x = self.Data.by - self.Data.idy + (self.Data.idh - self.Data.idoh) / 2;
            //self.Data.y = self.Data.bx - self.Data.idx + (self.Data.idw - self.Data.idow) / 2;
        } else {
            self.Data.x = self.Data.bx - self.Data.idx;
            self.Data.y = self.Data.by - self.Data.idy;
            //self.Data.x = self.Data.bx - self.Data.idx + (self.Data.idw - self.Data.idow) / 2;
            //self.Data.y = self.Data.by - self.Data.idy + (self.Data.idh - self.Data.idoh) / 2;
        }*/
        //var xs = 200/self.Data.bw;

        var scale = 2.0;
        self.Data.iow;//原图宽
        self.Data.ioh;//原图高
        self.ResData.path = self.Data.path;
        self.ResData.x = Math.round(self.Data.x * scale);
        self.ResData.y = Math.round(self.Data.y * scale);
        self.ResData.x = self.ResData.x<0?0:self.ResData.x;
        self.ResData.y = self.ResData.y<0?0:self.ResData.y;
        self.ResData.width = Math.round(self.Data.bw * scale);
        self.ResData.height = Math.round(self.Data.bh * scale);
        self.ResData.rotate = Math.round(self.Data.r);
        self.ResData.scaleX = 1;
        self.ResData.scaleY = 1;
        self.ResData.naturalWidth = Math.round(self.Data.idw * self.Data.sw * scale);
        self.ResData.naturalHeight = Math.round(self.Data.idh * self.Data.sh * scale);
        return self.ResData;
    }

    self.run = function () {
        chooseImage(self.wx, self.ctx);
    }


    self.reset = function () {
        self.Data.sw = 1;
        self.Data.sh = 1;
        self.Data.r = 0;
        self.Data.idw = self.Data.idow;
        self.Data.idh = self.Data.idoh;
        self.Data.idx = self.Data.idox;
        self.Data.idy = self.Data.idoy;
        self.needRedraw = true;
        //render();
    }

    var chooseImage = function () {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                if (tempFilePaths.length == 0) {
                    return;
                }
                path = tempFilePaths[0];
                wx.getImageInfo({
                    src: path,
                    success: function (res) {
                        renderFirst(path, res);
                    }
                });
            }
        });
    }

    var renderFirst = function (path, res) {
        var iw = res.width;
        var ih = res.height;
        var ch = self.Data.ch;
        var cw = self.Data.cw;
        self.Data.path = path;	//图片地址
        self.Data.iow = iw;	//图片原始宽
        self.Data.ioh = ih;	//图片原始高
        self.Data.sw = 1;
        self.Data.sh = 1;
        self.Data.r = 0;
        if (iw >= ih) {
            var w = cw;
            var h = cw / iw * ih;
            var dy = (ch - h) / 2;
            self.Data.idw = w;	//图片绘制宽
            self.Data.idh = h;	//图片绘制高
            self.Data.idx = 0;	//图片绘制x
            self.Data.idy = dy;	//图片绘制y
        } else {
            var h = ch;
            var w = ch / ih * iw;
            var dx = (cw - w) / 2;
            self.Data.idw = w;	//图片绘制宽
            self.Data.idh = h;	//图片绘制高
            self.Data.idx = dx;	//图片绘制x
            self.Data.idy = 0;	//图片绘制y
        }
        self.Data.idow = self.Data.idw;	//图片原始绘制宽
        self.Data.idoh = self.Data.idh;	//图片原始绘制高
        self.Data.idox = self.Data.idx;	//图片原始绘制x
        self.Data.idoy = self.Data.idy;	//图片原始绘制y
        //裁剪盒子
        var cw = self.Data.cw;
        var ch = self.Data.ch;
        var boxConf = self.Conf.box;
        var pw = boxConf.width;
        var ph = boxConf.height;
        if (/^(.*)\%$/.test(pw)) {
            var v = RegExp.$1;
            try {
                v = parseFloat(v);
                pw = cw * v / 100;
            } catch (e) {
                console.info("parse box width to float error");
            }
        }
        if (/^(.*)\%$/.test(ph)) {
            var v = RegExp.$1;
            try {
                v = parseFloat(v);
                ph = ch * v / 100;
            } catch (e) {
                console.info("parse box width to float error");
            }
        }

        var px = (cw - pw) / 2;
        var py = (ch - ph) / 2;
        self.Data.bw = pw;
        self.Data.bh = ph;
        self.Data.bx = px;
        self.Data.by = py;
        var nx = (self.Data.idx) + self.Data.idw / 2;
        var ny = (self.Data.idy) + self.Data.idh / 2;
        self.Data.onx = nx;
        self.Data.ony = ny;

        self.needRedraw = true;
        setTimeout(function () {
            self.needRedraw = true;
        }, 50);
        //render(true);
    }

    self.runRenderThread = function () {
        if (self.rit == null) {
            self.rit = setInterval(function () {
                //clear();
                if (self.needRedraw && path != null && path != "") {
                    renderImage();
                    self.needRedraw = false;
                }
            }, 17);
        }
    }

    self.clearRenderThread = function () {
        if (self.rit == null) {
            clearInterval(self.rit);
        }
    }

    self.printData = function () {
        var dataLabel = {//初始数据
            path: "图片路径",//
            cw: "canvas宽",	//
            ch: "canvas高",	//
            bw: "canvas-box宽",	//
            bh: "canvas-box高",	//
            bx: "canvas-box的x",	//
            by: "canvas-box的y",	//
            sw: "宽度缩放",	//
            sh: "高度缩放",	//
            r: "旋转角度",	//
            iow: "图片原始宽",	//
            ioh: "图片原始高",	//
            idw: "图片当前绘制宽",	//
            idh: "图片当前绘制高",	//
            idow: "图片原始绘制宽",//
            idoh: "图片原始绘制高",//
            idx: "图片当前绘制x",	//
            idy: "图片当前绘制y",	//
            idox: "图片原始绘制x",//
            idoy: "图片原始绘制y"	//
        };
        var text = "";
        console.info("=========================")
        for (var k in dataLabel) {
            var l = dataLabel[k] + "=" + self.Data[k];
            console.info(l);
        }
        console.info("=========================")
    }

    var clear = function () {
        ctx.translate(0, 0);
        ctx.clearRect(0, 0, self.Data.cw, self.Data.ch);
    }
    var calcDistance = function (p1, p2) {
        return Math.pow((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y), 0.5);
    }
    var toPI = function (r) {
        return r * Math.PI / 180;
    }

    var adjustImage = function () {
        if(self.Data.idw>self.Data.idh){//图片为横图，宽度不够裁剪盒子
            //console.info("图片为横图");
            //console.info("Data="+JSON.stringify(self.Data));
            if(self.Data.idh<self.Data.bh){
                //console.info("高度不够裁剪盒子");
                var d = self.Data.bh/self.Data.idh;
                self.Data.idh = self.Data.bh;
                self.Data.idw *= (1+d);
            }
        }else if(self.Data.idh>self.Data.idw ){//图片为竖图，高度不够裁剪盒子
            //console.info("图片为竖图");
            //console.info("Data="+JSON.stringify(self.Data));
            if(self.Data.idw<self.Data.bw){
                //console.info("宽度不够裁剪盒子");
                var d = self.Data.bw/self.Data.idw;
                self.Data.idw = self.Data.bw;
                self.Data.idh *= (1+d);
            }
        }
        var lt, rt, lb, rb;//左上距离，右上距离，左下距离，右下距离
        var w, h;//图片绘制宽高
        var x, y;//图片绘制的左上角点坐标
        var r = self.Data.r;//图片旋转角度
        var ilt = {};//图片左上点
        var irt = {};//图片右上点
        var ilb = {};//图片左下点
        var irb = {};//图片右下点
        var o = {};//图片圆心坐标

        var blt = {x: self.Data.bx, y: self.Data.by};//裁剪盒子左上点
        var brt = {x: self.Data.bx + self.Data.bw, y: self.Data.by};//裁剪盒子右上点
        var blb = {x: self.Data.bx, y: self.Data.by + self.Data.bh};//裁剪盒子左下点
        var brb = {x: self.Data.bx + self.Data.bw, y: self.Data.by + self.Data.bh};//裁剪盒子右下点

        x = self.Data.idx - self.Data.idw * (self.Data.sw - 1) / 2;
        y = self.Data.idy - self.Data.idh * (self.Data.sh - 1) / 2;
        w = self.Data.idw * self.Data.sw;
        h = self.Data.idh * self.Data.sh;
        o.x = x + w / 2;
        o.y = y + h / 2;
        //console.info("当前角度：" + r);
        ilt.x = (x - o.x) * Math.cos(toPI(r)) - (y - o.y) * Math.sin(toPI(r)) + o.x;
        ilt.y = (y - o.y) * Math.cos(toPI(r)) + (x - o.x) * Math.sin(toPI(r)) + o.y;
        //console.info("左上角坐标：" + JSON.stringify(ilt));

        irt.x = (x + w - o.x) * Math.cos(toPI(r)) - (y - o.y) * Math.sin(toPI(r)) + o.x;
        irt.y = (y - o.y) * Math.cos(toPI(r)) + (x + w - o.x) * Math.sin(toPI(r)) + o.y;
        //irt.x = ilt.x+w;
        //irt.y = ilt.y;
        //console.info("右上角坐标：" + JSON.stringify(irt));

        ilb.x = (x - o.x) * Math.cos(toPI(r)) - (y + h - o.y) * Math.sin(toPI(r)) + o.x;
        ilb.y = (y + h - o.y) * Math.cos(toPI(r)) + (x - o.x) * Math.sin(toPI(r)) + o.y;
        //ilb.x = ilt.x;
        //ilb.y = ilt.y+h;
        //console.info("左下角坐标：" + JSON.stringify(ilb));

        irb.x = (x + w - o.x) * Math.cos(toPI(r)) - (y + h - o.y) * Math.sin(toPI(r)) + o.x;
        irb.y = (y + h - o.y) * Math.cos(toPI(r)) + (x + w - o.x) * Math.sin(toPI(r)) + o.y;
        //irb.x = ilt.x+w;
        //irb.y = ilt.y+h;
        //console.info("右下角坐标：" + JSON.stringify(irb));

        var leftst = Math.min(Math.min(ilt.x, irt.x), Math.min(ilb.x, irb.x));
        var rightst = Math.max(Math.max(ilt.x, irt.x), Math.max(ilb.x, irb.x));

        var topst = Math.min(Math.min(ilt.y, irt.y), Math.min(ilb.y, irb.y));
        var bottomst = Math.max(Math.max(ilt.y, irt.y), Math.max(ilb.y, irb.y));
        //计算裁剪盒子与图片的差距，上不能为负，下不能为正，左不能为负，右不能为正
        //上方差距
        var dtlt = blt.y - topst;
        var dtrt = brt.y - topst;
        //下方差距
        var dblb = blb.y - bottomst;
        var dbrb = brb.y - bottomst;
        //左方差距
        var dllt = blt.x - leftst;
        var dllb = blb.x - leftst;
        //右方差距
        var drrt = brt.x - rightst;
        var drrb = brb.x - rightst;
        if((dtlt < 0 && dblb > 0)||(dllt < 0 &&drrt > 0)){
            if((dtlt < 0 && dblb > 0)){
                //console.info("上下超出");
                //var d = self.Data.bh/self.Data.idh;
                //self.Data.idh = self.Data.bh;
                //self.Data.idw *= (1+d);
            }else{
                //console.info("左右超出");
                //var d = self.Data.bw/self.Data.idw;
                //self.Data.idw = self.Data.bw;
                //self.Data.idh *= (1+d);
            }
            return true;
        }else{
            if (dtlt < 0 || dtrt < 0) {//上不能为负
                //console.info("上不能为负:"+dtlt);
                self.Data.idy += dtlt;
            }
            if (dblb > 0 || dbrb > 0) {//下不能为正
                //console.info("下不能为正:"+dblb);
                self.Data.idy += dblb;
            }
            if (dllt < 0 || dllb < 0) {//左不能为负
                //console.info("左不能为负:"+dllt);
                self.Data.idx += dllt;
            }
            if (drrt > 0 || drrb > 0) {//右不能为正
                //console.info("右不能为正:"+drrt);
                self.Data.idx += drrt;
            }
        }
        return false;
    }


    var renderImage = function (first) {
        //printData();
        if(adjustImage()){
            return;
        }
        var nx = (self.Data.idx) + self.Data.idw / 2;
        var ny = (self.Data.idy) + self.Data.idh / 2;
        //var nx = self.Data.cw/2;
        //var ny = self.Data.ch/2;
        //绘制图片位置-确定锚点
        translate(nx, ny);
        //绘制图片缩放
        scale(self.Data.sw, self.Data.sh);
        //绘制图片角度
        rotate(self.Data.r);
        /*if (first != null) {
         drawImage(path, self.Data.idx, self.Data.idy, self.Data.idw, self.Data.idh, 0, 0, self.Data.iow, self.Data.ioh);
         } else {
         drawImage(path, self.Data.idx - nx, self.Data.idy - ny, self.Data.idw, self.Data.idh, 0, 0, self.Data.iow, self.Data.ioh);
         }*/
        //在手机上首次渲染中心点位置不对的情景
        drawImage(path, self.Data.idx - nx, self.Data.idy - ny, self.Data.idw, self.Data.idh, 0, 0, self.Data.iow, self.Data.ioh);
        //重置canvas缩放
        scale(1 / self.Data.sw, 1 / self.Data.sh);
        //重置canvas角度
        rotate(-self.Data.r);
        //重置canvas位置
        translate(-nx, -ny);
        //ctx.draw();
        ctx.restore();
        self.Data.osw = self.Data.sw;
        self.Data.osh = self.Data.sh;



        var cw = self.Data.cw;
        var ch = self.Data.ch;

        var pw = self.Data.bw;
        var ph = self.Data.bh;
        var px = self.Data.bx;
        var py = self.Data.by;


        //参考线
        ctx.save()
        ctx.setGlobalAlpha(0.3)
        ctx.setStrokeStyle("#dddddd")
        ctx.moveTo(px, py + ph / 3);
        ctx.lineTo(px + pw, py + ph / 3);
        ctx.moveTo(px, py + ph * 2 / 3);
        ctx.lineTo(px + pw, py + ph * 2 / 3);
        ctx.moveTo(px + pw / 3, py);
        ctx.lineTo(px + pw / 3, py + ph);
        ctx.moveTo(px + pw * 2 / 3, py);
        ctx.lineTo(px + pw * 2 / 3, py + ph);
        ctx.stroke()
        //ctx.draw(true)
        ctx.restore()

        ctx.save()
        ctx.setFillStyle("#000000")
        ctx.setGlobalAlpha(0.3)
        //罩
        //ctx.fillRect(0, 0, cw, py-2)//上
        //ctx.fillRect(0, ch - (py-2), cw, py-2)//下
        //ctx.fillRect(0, py-2, px-2, ph+4)//左
        //ctx.fillRect(cw - (px-2), py-2, px-2, ph+4)//右
        ctx.rect(0, 0, cw, py)//上
        ctx.rect(0, ch - py, cw, py)//下
        ctx.rect(0, 0, px, ch)//左
        ctx.rect(cw - px, 0, px, ch)//右\
        ctx.fill()
        ctx.restore()

        //框
        ctx.save()
        ctx.setGlobalAlpha(1)
        ctx.setStrokeStyle(color)
        ctx.setLineWidth(2)
        ctx.strokeRect(px, py, pw, ph)
        ctx.restore()

        ctx.draw()

    }

    //绘制遮罩
    var renderMask = function () {
        //debugger

    }

    var renderImage4Rotate = function (rotate) {
        var r = self.Data.r;
        r += rotate;
        r = r < 0 ? (r + 360) : (r > 360 ? (r - 360) : r);
        self.Data.r = r;
        if(adjustImage()){
            self.Data.r -= rotate;
            return;
        }
        self.needRedraw = true;



        //render();
    }

    var renderImage4Scale = function (scale) {
        var s = self.Data.sw;
        s += scale;
        s = s < 0 ? 0 : s;
        //TODO x,y 校准
        //TODO w,h 校准
        //self.Data.idw = self.Data.idow*s;
        //self.Data.idh = self.Data.idoh*s;
        self.Data.sw = s;
        self.Data.sh = s;
        if(adjustImage()){
            self.Data.sw -= scale;
            self.Data.sh -= scale;
            return;
        }
        self.needRedraw = true;
        //render();
    }

    var renderImage4Move = function (direct, move) {
        var x = self.Data.idx;	//图片绘制x
        var y = self.Data.idy;	//图片绘制y
        if (direct == "u") {
            y -= move;
        } else if (direct == "d") {
            y += move;
        } else if (direct == "l") {
            x -= move;
        } else if (direct == "r") {
            x += move;
        }
        self.Data.idx = x;
        self.Data.idy = y;
        if(adjustImage()) {
            if (direct == "u") {
                self.Data.idy += move;
            } else if (direct == "d") {
                self.Data.idy -= move;
            } else if (direct == "l") {
                self.Data.idx += move;
            } else if (direct == "r") {
                self.Data.idx -= move;
            }
            return;
        }
        self.needRedraw = true;
        //render();
    }
    //平移
    //旋转
    //缩放
    self.r2l = function (r) {
        renderImage4Rotate(r == null ? -self.Conf.rr : r);
    }
    self.r2r = function (r) {
        renderImage4Rotate(r == null ? self.Conf.rr : r);
    }
    self.s2b = function (r) {
        renderImage4Scale(r == null ? self.Conf.sr : r);
    }
    self.s2s = function (r) {
        renderImage4Scale(r == null ? -self.Conf.sr : r);
    }
    self.m2u = function (r) {
        renderImage4Move("u", r == null ? self.Conf.mr : r);
    }
    self.m2d = function (r) {
        renderImage4Move("d", r == null ? self.Conf.mr : r);
    }
    self.m2l = function (r) {
        renderImage4Move("l", r == null ? self.Conf.mr : r);
    }
    self.m2r = function (r) {
        renderImage4Move("r", r == null ? self.Conf.mr : r);
    }

    var translate = function (cx, cy) {
        ctx.translate(cx, cy);
    }
    var scale = function (sw, sh) {
        ctx.scale(sw, sh);
    }
    var rotate = function (r) {
        ctx.rotate(r * Math.PI / 180);
    }
    var drawImage = function (path, tx, ty, tw, th, sx, sy, sw, sh) {
        ctx.drawImage(path, tx, ty, tw, th, sx, sy, sw, sh);
    }

}


//其他
var canvasId = 'myCanvas';
var path = null;
var labelShowTags = ["block", "block", "block"];

var ctx;
var originType;//来源类型，比如说是头像裁剪，微信群二维码裁剪。根据不同的裁剪类型决定请求的接口
var originPage;//来源页面，返回时调用
var userId;
var offlineCardId;
var cardId;//名片ID
var flag; //正面&反面
var templateId; //模板id
var width = 400;
var height = 400;
var appInstance = getApp();
width = appInstance.global.sysInfo.windowWidth;
height = appInstance.global.sysInfo.windowHeight;
width = width;
height = width;
var cropper;
var tsx1, tsy1;//触摸开始点1
var tsx2, tsy2;//触摸开始点2
var ds = null, ods = 0;//触摸点距离,原始图片放缩
var requester = getApp().global.requester;
var ORIGIN_TYPE_USER_AVATAR = "userAvatar";//用户头像
var ORIGIN_TYPE_OFFLINE_CARD_AVATAR = "offlineCardAvatar";//线下名片头像
var ORIGIN_TYPE_OCR_CARD_THUMBNAIL = "ocrCardThumbnail";//拍照新增名片截图
var ORIGIN_TYPE_OCR_OFFLINE_CARD_THUMBNAIL = "ocrOfflineCardThumbnail";//拍照收纳名片截图
var ORIGIN_TYPE_USER_WX_QR = "userWxQr";//用户微信二维码
var ORIGIN_TYPE_CARD_WX_GROUP_QR = "cardWxGroupQr";//名片微信群二维码
var ORIGIN_TYPE_CARD_THUMBNAIL = "cardThumbnail"; //模板拍照
Page({
    data: {
        tcanvasIcon: tcanvasIcon,
        width: width,
        height: height,
        canvasId: canvasId,
        labelShowTags: labelShowTags,
        data: ""
    },
    onLoad: function (res) {
      var isRequestid = Date.parse(new Date()) / 1000;
      getApp().isRequest = isRequestid;
        var self = this;
        console.info("onLoad-----------------");
        //获取上个页面传递过来的来源类型
        originType = res.originType;
        userId = res.userId;
        offlineCardId = res.offlineCardId;
        cardId = res.cardId;
        flag = res.flag;
        templateId = res.templateId;
        console.info("load crop page origin type is[" + originType + "]" + JSON.stringify(res));
        ctx = wx.createCanvasContext(canvasId);
        cropper = new Cropper(wx, ctx, canvasId);
        var box = {width: "40%", height: "40%"};
        if (originType == ORIGIN_TYPE_USER_AVATAR || originType == ORIGIN_TYPE_OFFLINE_CARD_AVATAR
            || originType == ORIGIN_TYPE_USER_WX_QR || originType == ORIGIN_TYPE_CARD_WX_GROUP_QR
        ) {
            box = {//裁剪盒子配置
                width: "40%", height: "40%"
            }
        } else if (originType == ORIGIN_TYPE_OCR_CARD_THUMBNAIL
        ||originType == ORIGIN_TYPE_OCR_OFFLINE_CARD_THUMBNAIL||originType == ORIGIN_TYPE_CARD_THUMBNAIL) {
            box = {//裁剪盒子配置
                width: "75%", height: "45%"
            }
        }
        cropper.setConf({sw: width, sh: height, box: box});
        cropper.setData({cw: width, ch: height});
        cropper.run(true);
        cropper.runRenderThread();
    },
    touchstart: function (e) {
        var touches = e.touches;
        //touches.push({x:100,y:100})
        if (touches.length == 1) {
            //单点触摸为移动模式
            var touch1 = touches[0];
            var x1 = touch1.x || touch1.clientX;
            var y1 = touch1.y || touch1.clientY;
            tsx1 = x1;
            tsy1 = y1;
        } else if (touches.length >= 2) {
            //多点触摸为缩放模式
            var touch1 = touches[0];
            tsx1 = touch1.x || touch1.clientX;
            tsy1 = touch1.y || touch1.clientY;
            var touch2 = touches[1];
            tsx2 = touch2.x || touch2.clientX;
            tsy2 = touch2.y || touch2.clientY;
            var nds = Math.pow(((tsx2 - tsx1) * (tsx2 - tsx1) + (tsy2 - tsy1) * (tsy2 - tsy1)), 0.5);
            ds = nds;
        } else {
        }
    },
    touchmove: function (e) {
        var touches = e.touches;
        //单点触摸还是多点触摸
        //console.info(JSON.stringify(touches));
        //touches.push({x:100,y:100})
        if (touches.length == 1) {
            //单点触摸为移动模式
            var touch1 = touches[0];
            var x1 = touch1.x || touch1.clientX;
            var y1 = touch1.y || touch1.clientY;
            if (tsx1 != null && tsy1 != null) {
                var dx = x1 - tsx1;
                var dy = y1 - tsy1;
                cropper.m2r(dx);
                cropper.m2d(dy);
            }
            tsx1 = x1;
            tsy1 = y1;
        } else if (touches.length >= 2) {
            //多点触摸为缩放模式
            var touch1 = touches[0];
            tsx1 = touch1.x || touch1.clientX;
            tsy1 = touch1.y || touch1.clientY;
            var touch2 = touches[1];
            tsx2 = touch2.x || touch2.clientX;
            tsy2 = touch2.y || touch2.clientY;
            var nds = Math.pow(((tsx2 - tsx1) * (tsx2 - tsx1) + (tsy2 - tsy1) * (tsy2 - tsy1)), 0.5);
            if (ds == null) {
                ds = nds;
            } else {
                var d = nds - ds;
                var dd = d / ds;
                //console.info("nds="+nds+"|ds="+ds);
                //console.info("d="+d+"|dd="+dd);
                if (d < 0) {//缩小
                    cropper.s2b(ods);
                    cropper.s2s(dd - ods);
                } else {//放大
                    cropper.s2s(ods);
                    cropper.s2b(dd - ods);
                }
                ods = dd;
                ds = nds;
            }
        } else {
        }
    },
    touchend: function (e) {
        ds = tsx1 = tsy1 = tsx2 = tsy2 = null;
        ods = 0;
    },
    tapCanvas: function (e) {
        var touches = e.touches;
        var touch = touches[0];
        var x = touch.x;
        var y = touch.y;
    },
    errorCanvas: function (e) {
        //如果异常的话，则提示用户返回
        //debugger
    },
    chooseImage: function (e) {
        console.info("chooseImage");
        cropper.run(true);
    },
    rotateLeft: function (e) {
        console.info("rotateLeft");
        cropper.r2l();
    },
    rotateRight: function (e) {
        console.info("rotateRight");
        cropper.r2r();
    },
    zoomOut: function (e) {
        console.info("zoomOut");
        cropper.s2b();
    },
    zoomIn: function (e) {
        console.info("zoomIn");
        cropper.s2s();
    },
    rotate90: function (e) {
        console.info("rotate90");
        cropper.r2l(-90);
    },
    reset: function (e) {
        console.info("rotate90");
        cropper.reset();
    },
    close: function (e) {
        console.info("close");
        wx.navigateBack({
            delta: 1
        });
    },
    ok: function (e) {
        if(path==null){
            wx.showModal({
                title: '提示',
                content: '请先选择图片',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                }
            });
            return;
        }
        cropper.clearRenderThread();
        //cropper.printData();
        var data = cropper.getResData();
        //console.info(JSON.stringify(data));
        //console.info("ok");

        //console.info("======================")
        //console.info(cropper.Data);
        //console.info("-----")
        //console.info(JSON.stringify(data));
        //console.info("----------------------")
        //console.info("http://7xrx9e.com1.z0.glb.clouddn.com/user/5722dc8850026640f25ddc51/avatar/99df5bc6b0324e53b9c5bf1693dbbfe0.jpg");
        //console.info("?imageMogr2/auto-orient/thumbnail/" + data.naturalWidth + "x" + data.naturalHeight + "!/rotate/" + data.rotate + "/crop/!" + data.width + "x" + data.height + "a" + data.x + "a" + data.y)
        //TODO 请求接口
        if (originType == ORIGIN_TYPE_USER_AVATAR) {
            wx.showToast({
                title: '正在上传用户头像',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadUserAvatar(userId, cardId,data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    console.info("res="+JSON.stringify(res));
                    wx.hideToast();
                    wx.showToast({
                        title: '上传用户头像成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传用户头像成功");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传用户头像失败");
                    wx.showToast({
                        title: '上传用户头像失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        } else if (originType == ORIGIN_TYPE_OFFLINE_CARD_AVATAR) {
            wx.showToast({
                title: '正在上传线下名片头像',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadOfflineCardAvatar(userId, offlineCardId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '上传线下名片头像成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传线下名片头像成功");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传线下名片头像失败");
                    wx.showToast({
                        title: '上传线下名片头像失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        } else if (originType == ORIGIN_TYPE_OCR_CARD_THUMBNAIL) {
            //ocr新增名片更换截图
            wx.showToast({
                title: '正在上传',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadCardThumbnail(userId, cardId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '上传成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传名片名片截图成功");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传名片名片截图失败");
                    wx.showToast({
                        title: '上传失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        } else if (originType == ORIGIN_TYPE_USER_WX_QR) {
            //上传用户微信二维码
            wx.showToast({
                title: '正在上传',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadUserWxQr(userId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '上传成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传用户微信二维码成功");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传用户微信二维码失败");
                    wx.showToast({
                        title: '上传失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        } else if (originType == ORIGIN_TYPE_CARD_WX_GROUP_QR) {
            //上传名片微信群二维码
            wx.showToast({
                title: '正在上传',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadCardWxGroupQr(userId, cardId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '上传成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传名片微信群二维码");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传名片微信群二维码");
                    wx.showToast({
                        title: '上传失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        } else if (originType == ORIGIN_TYPE_OCR_OFFLINE_CARD_THUMBNAIL) {
            //ocr线下名片更换截图
            wx.showToast({
                title: '正在上传',
                mask: true,
                icon: 'loading',
                duration: 10000
            });
            requester.ajaxUploadOfflineCardThumbnail(userId, offlineCardId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
                function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '上传成功',
                        mask: true,
                        icon: 'success',
                        duration: 1000
                    });
                    console.info("上传线下名片截图成功");
                    wx.navigateBack({
                        delta: 1
                    });
                }, function (res) {
                    wx.hideToast();
                    console.info("上传线下名片截图失败");
                    wx.showToast({
                        title: '上传失败',
                        mask: true,
                        icon: 'fail',
                        duration: 1000
                    });
                }, function (err) {
                    wx.hideToast();
                    console.info("调用失败");
                });
        }else if(originType == ORIGIN_TYPE_CARD_THUMBNAIL){
          wx.showToast({
              title: '正在上传拍照模板',
              mask: true,
              icon: 'loading',
              duration: 10000
          });
          requester.ajaxUploadUserCardThumbnail(userId,cardId,flag,templateId, data.path, data.x, data.y, data.width, data.height, data.rotate, data.scaleX, data.scaleY, data.naturalWidth, data.naturalHeight,
            function(res){
              wx.hideToast();
              wx.showToast({
                  title: '上传成功',
                  mask: true,
                  icon: 'success',
                  duration: 1000
              });
              console.info("上传名片模板截图成功");
              wx.navigateBack({
                  delta: 1
              });
            }, function(res){
              wx.hideToast();
              console.info("上传名片模板截图失败");
              wx.showToast({
                  title: '上传失败',
                  mask: true,
                  icon: 'fail',
                  duration: 1000
              });
            }, function(err){
              wx.hideToast();
              console.info("调用失败");
            })
        }
    }
});
