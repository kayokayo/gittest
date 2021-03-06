//HTML5游戏开发者社区 AND 9TECH
//作者 白泽

//定义全局的GL句柄
var gl;

//正交矩阵
var oRMatrixList=[];

//场景比例
var ratio;

//场景宽度
var stageWidth;

//场景高度
var stageHeight;

//显示列表
var displayerlist=[];

//初始化WEBGL和画布
function initGL() {
    //获取画布myWebGL是自定义名称
    var canvas=document.getElementById("myWebGL");
    try {
        //获取WEBGL的句柄,这个骚气的名字ID不是我取的,你必须得用这个,我一开始也以为是自定义的
        gl = canvas.getContext("experimental-webgl");

        //设置WEBGL的画布,坐标为0,0,宽度和高度最好和原始画布的一样
        gl.viewport(0, 0, canvas.width, canvas.height);

        //设置场景宽度
        stageWidth=canvas.width;

        //设置场景高度
        stageHeight=canvas.height;

        //设置比例
        ratio=stageWidth/stageHeight

    } catch (e) {
    }
    if (!gl) {

        //如果不支持,你可以回滚到canvas的渲染机制
        alert("Could not initialise WebGL, sorry :-(");
    }
}

//获取着色器
function getShader(gl, id) {

    //这里是一系列的JS解析过程,实际上你不这么做直接上传字符串也可以
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {

        //根据参数定义不同的着色器类型,这里定义的是像素着色器类型
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {

        //这里定义的是一个顶点着色器类型
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    //绑定着色器字符串到到着色器里
    gl.shaderSource(shader, str);

    //编译这个着色器,就是生成这段程序
    gl.compileShader(shader);

    //如果创建不成功,那就是你写错代码了
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    //最后返回出这个着色器
    return shader;
}


//渲染函数,这里是循环调用的
function drawScene() {
    //每帧清理画面
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for(var i=0;i<displayerlist.length;i++)
    {
        displayerlist[i].paint();
    }
    //循环调用
    setTimeout(drawScene,0);
}


/**
 * 正交视口模型矩阵
 * @param m 正交的一维数组
 * @param left 左边界
 * @param right 右边界
 * @param bottom 底边界
 * @param top 上边界
 * @param near 近截面
 * @param far 远截面
 */
function orthoM(m,left,right,bottom,top,near,far)
{
    m[0] = 2.0*1.0/(right - left);
    m[5] = 2.0*1.0/(top - bottom);
    m[10] = 1.0/(far - near);

    m[12] = (right + left)/(right - left);
    m[13] = (bottom + top)/(bottom - top);
    m[14] = near/(near - far);

    m[1] = m[2] = m[3] = m[4] =m[6] = m[7] = m[8] = m[9] = m[11] = 0;
    m[15] = 1.0;
}


//启动函数
function webGLStart() {


	alert("进入webglstart");
    //JS居然可以这样写,添加动态属性,这是我网上学的办法,嗯,先这么用着吧
    //创建一个图片
    this.image = new Image();

    //如果图片读取完毕就执行初始化过程,在之后的操作里,你可以把这里优化到你的结构里,我现在写在一起方便你的查看
    this.image.onload = function () {

        //初始化GL
        initGL();

        //创建纹理
        var texture=new Texture2D(image);

        //创建着色器
        var shader=new Shader();

        //创建显示对象
        var mc=new MovieClip2D(texture,shader);

        //设置坐标居中
        mc.x=stageWidth/2;
        mc.y=stageHeight/2;

        //添加到显示列表
        addChild(mc);

        //创建显示对象2,共用纹理和着色器
        var mc2=new MovieClip2D(texture,shader);

        //没有设置坐标默认为左上角0,0点
        addChild(mc2);

        //游戏循环渲染
        setTimeout(drawScene,0);

        //创建显示对象2,共用纹理和着色器
        var mc3=new MovieClip2D(texture,shader);
        //设置一些属性
        mc3.x=300;
        mc3.y=300;
        mc3.scaleX=.5;
        mc3.scaleY=.5;
        addChild(mc3);


        //创建显示对象2,共用纹理和着色器
        var mc4=new MovieClip2D(texture,shader);
        //设置一些属性
        mc4.x=600;
        mc4.y=300;
        mc4.scaleX=.5;
        mc4.scaleY=.5;
        mc4.rotation=45;
        //没有设置坐标默认为左上角0,0点
        addChild(mc4);

        //游戏循环渲染
        setTimeout(drawScene,0);
    }

    //设置图片地址
    this.image.src = "taipinyang.png";
	alert("出webglstart");
}

//添加显示对象
function addChild(child)
{
    displayerlist.push(child);
}

//删除显示对象
function removeChild(child)
{
    displayerlist.splice(displayerlist.index(child),1)
}



/**
 * 矩阵类,矩阵的计算是你的引擎里面消耗最多的地方,所以也是重点优化的地方,矩阵优化得好对因的引擎效率提升非常大,现在我们使
 * 用的矩阵类是完全原始未优化的,它与优化后的效率相差非常之大,不过这个我会放在后面的优化篇讲解,为了不使你混乱,目前可以
 * 不用关注,只需要关注原理就好
 */
function Matrix2D(){
    //矩阵的原始信息
    this.rawData=[];
    //矩阵的旋转存储信息
    this.spinArray=[];
    //矩阵的位移缩放倾斜存储信息
    this.translationArray=[];

    /**
     * 重置矩阵
     */
    this.identity=function()
    {
        this.translationArray = [];
        this.spinArray = [];
        this.rawData = [];
    }

    /**
     * 3*3矩阵融合
     */
    this.add33=function(v1,v2)
    {
        var m33 = [];
        m33[0]=v1[0]*v2[0]+v1[1]*v2[3]+v1[2]*v2[6];
        m33[1]=v1[0]*v2[1]+v1[1]*v2[4]+v1[2]*v2[7];
        m33[2]=v1[0]*v2[2]+v1[1]*v2[5]+v1[2]*v2[8];


        m33[3]=v1[3]*v2[0]+v1[4]*v2[3]+v1[5]*v2[6];
        m33[4]=v1[3]*v2[1]+v1[4]*v2[4]+v1[5]*v2[7];
        m33[5]=v1[3]*v2[2]+v1[4]*v2[5]+v1[5]*v2[8];

        m33[6]=v1[6]*v2[0]+v1[7]*v2[3]+v1[8]*v2[6];
        m33[7]=v1[6]*v2[1]+v1[7]*v2[4]+v1[8]*v2[7];
        m33[8]=v1[6]*v2[2]+v1[7]*v2[5]+v1[8]*v2[8];
        return m33;
    }

    /**
     * 1*3矩阵融合
     */
    this.add13=function(v1,v2)
    {
        var m13 = [];
        m13[0]=v1[0]*v2[0]+v1[1]*v2[3]+v1[2]*v2[6];
        m13[1]=v1[0]*v2[1]+v1[1]*v2[4]+v1[2]*v2[7];
        m13[2]=v1[0]*v2[2]+v1[1]*v2[5]+v1[2]*v2[8];
        return m13;
    }

    /*
     *旋转
     */
    this.appendRotation=function(rotation)
    {
        var cos = Math.cos(rotation * Math.PI / 180);
        var sin = Math.sin(rotation * Math.PI / 180);
        //旋转
        this.spinArray[0]=cos;
        this.spinArray[1]=sin;
        this.spinArray[2]=0;
        this.spinArray[3]=-sin;
        this.spinArray[4]=cos;
        this.spinArray[5]=0;
        this.spinArray[6]=0;
        this.spinArray[7]=0;
        this.spinArray[8]=1;
    }

    //平移,缩放,倾斜
    this.appendTranslation=function(x,y,scaleX,scaleY,biasX,biasY)
    {
        this.translationArray[0]=scaleX;
        this.translationArray[1]=biasY;
        this.translationArray[2]=0;
        this.translationArray[3]=biasX;
        this.translationArray[4]=scaleY;
        this.translationArray[5]=0;
        this.translationArray[6]=x;
        this.translationArray[7]=y;
        this.translationArray[8] = 1;
    };

    /**
     * 更新矩阵信息
     */
    this.upDataBasrMatrix=function(rotation,x,y,scaleX,scaleY,biasX,biasY)
    {
        //计算旋转后的矩阵
        this.appendRotation(rotation);

        //计算位移等其他变换后的矩阵
        this.appendTranslation(x,y,scaleX,scaleY,biasX,biasY);

        //融合这2个变换矩阵
        this.rawData = this.add33(this.spinArray,this.translationArray);
    }

}

/**
 * 矩阵代理面板类,我们会把顶点push到这个面板类里,从而对这个面板实现顶点的变换操作
 */
function Panel()
{
    /**
     * 属性集合
     */
    this.mX = 0;
    this.mY= 0;
    this.mRotation = 0;
    this.mScaleX = 1;
    this.mScaleY = 1;
    this.mBiasX = 0;
    this.mBiasY = 0;
    this.mPivotX = 0;
    this.mPivotY = 0;

    //矩阵
    this.matrix2D=new Matrix2D();

    //元素列表
    this.itemList=[];

    //元素信息列表
    this.itemData=[];

    //原始元素信息列表
    this.itemDataAgency=[];

    //这个属性用于存放最终计算的出来的点,也就是屏幕上最终的坐标,[0]代表X,[1]代表Y,实际上这可以是一个对象
    this.point=[];

    //记录当前面板中有多少个点对象
    this.ids=0;

    /**
     * 获取矩阵信息
     */
    this.getMatrix2D=function()
    {
        return this.matrix2D;
    }

    /**
     * 设置矩阵信息
     */
    this.setMatrix2D=function(matrix2D)
    {
       this.matrix2D = matrix2D;
    }


    /**
     * 更新顶点缓存信息
     */
    this.upDataFrame=function(p)
    {
        this.itemData[this.ids]=new Point2D();
        this.itemData[this.ids].setX(p.getX());
        this.itemData[this.ids].setY(p.getY());

        this.itemDataAgency[this.ids]=new Point2D();
        this.itemDataAgency[this.ids].setX(p.getX());
        this.itemDataAgency[this.ids].setY(p.getY());
    }

    /**
     * 获得点数据
     */
    this.setPoint=function(value,point)
    {
        this.itemData[value]=point;
    }

    /**
     * 设置点数据
     */
    this.getPoint=function(value)
    {
        return this.itemData[value];
    }

    /**
     * 更新矩阵操作
     */
    this.upDataRaw=function()
    {
        for (var i = 0; i <this.ids; i++)
        {
            //零时缓存顶点的信息,实际上这一步在后期的优化中可以省略掉，毕竟每次做这样的操作还是很消耗的
            var cacheList=[];
            cacheList[0]=this.itemDataAgency[i].getX();
            cacheList[1]=this.itemDataAgency[i].getY();
            cacheList[2]=1;

            //存储1*3的矩阵计算后结果,也就是实际计算出来的屏幕坐标
            var point = this.matrix2D.add13(cacheList,this.matrix2D.rawData);

            //改变缓存里的顶点的坐标信息
            this.itemList[i].setX(point[0]);
            this.itemList[i].setY(point[1]);
        }
    }

    /**
     * 更新矩阵操作
     */
    this.upDataMatrix=function()
    {
        //根据输入的信息更新矩阵
        this.matrix2D.upDataBasrMatrix(this.mRotation,this.mX + this.mPivotX, this.mY + this.mPivotY, this.mScaleX,this.mScaleY, this.mBiasX, this.mBiasY);
        //然后更新顶点信息
        this.upDataRaw();
    }


    /**
     * 更新顶点的原始顶点坐标
     */
    this.upDataMatrixData=function(pivotX,pivotY,scaleX,scaleY,biasX,biasY)
    {
        this.matrix2D.upDataBasrMatrix(0,pivotX,pivotY, scaleX, scaleY, biasX, biasY);
        for (var i = 0; i <this.ids; i++)
        {
            var cacheList=[];
            cacheList[0]=this.itemData[i].getX();
            cacheList[1]=this.itemData[i].getY();
            cacheList[2]=1;
            var point = this.matrix2D.add13(cacheList,matrix2D.rawData);
            this.itemDataAgency[i].setX(point[0]);
            this.itemDataAgency[i].setY(point[1]);
        }
    }


    /**
     * 添加元素
     */
    this.addItem=function(obj)
    {
        this.itemList[this.ids]=obj;
        this.upDataFrame(obj);
        this.ids++;
    }




    /**
     * 更改或读取面板X坐标
     */
    this.getX=function(){return this.mX;};
    this.setX=function(value)
    {
        this.mX = value;
    }

    /**
     * 更改或读取面板Y坐标
     */
    this.getY=function() {return this.mY;};
    this.setY=function(value)
    {
         this.mY = value;
    }


    /**
     * 更改或读取面板角度
     */
    this.getRotation=function(){return this.mRotation;};
    this.setRotation=function(value)
    {
         this.mRotation = value;
    }

    /**
     * 更改或读取面板X比例
     */
    this.getScaleX=function() {return this.mScaleX;};
    this.setScaleX=function(value)
    {
        this.mScaleX = value;
    }

    /**
     * 更改或读取面板Y比例
     */
    this.getScaleY=function(){return this.mScaleY;};
    this.setScaleY=function(value)
    {
        this.mScaleY = value;
    }

    /**
     * 更改或读取面板X倾斜度
     */
    this.getBiasX=function() {return this.mBiasX;};
    this.setBiasX=function(value)
    {
        this.mBiasX = value;
    }

    /**
     * 更改或读取面板Y倾斜度
     */
    this.getBiasY=function(){return this.mBiasY;};
    this.setBiasY=function(value)
    {
        this.mBiasY = value;
    }

    /**
     * 更改或读取面板X偏移值
     */
    this.getPivotY=function() {return this.mPivotY;};
    this.setPivotY=function(value)
    {
        this.mPivotY = value;
    }

    /**
     * 更改或读取面板Y偏移值
     */
    this.getPivotX=function(){return this.mPivotX;};
    this.setPivotX=function(value)
    {
        this.mPivotX = value;
    }
}

/**
 * 2D点对象
 *
 */
function Point2D(){
    this.mX=0;
    this.mY=0;
    this.getX=function() {
        return this.mX;
    }
    this.setX=function(value) {
        this.mX = value;
    }
    this.getY=function() {
        return this.mY;
    }
    this.setY=function(value) {
        this.mY = value;
    }
}

/**
 * 影片剪辑
 */
function MovieClip2D(v_texture,v_shader)
{
    this.texture=v_texture;
    this.shader=v_shader;

    //创建4个顶点
    this.right_down_point=new Point2D();
    this.right_up_point=new Point2D();
    this.left_down_point=new Point2D();
    this.left_up_point=new Point2D();

    //创建一个面板
    this.panel=new Panel();


    //设置4个顶点的初始化坐标
    this.left_down_point.setX(-1.0*512/stageHeight);
    this.left_down_point.setY(-1.0*512/stageHeight);

    this.right_down_point.setX(1.0*512/stageHeight);
    this.right_down_point.setY(-1.0*512/stageHeight);

    this.left_up_point.setX(-1.0*512/stageHeight);
    this.left_up_point.setY(1.0*512/stageHeight);

    this.right_up_point.setX(1.0*512/stageHeight);
    this.right_up_point.setY(1.0*512/stageHeight);


    //添加到面板里
    this.panel.addItem(this.right_down_point);
    this.panel.addItem(this.right_up_point);
    this.panel.addItem(this.left_down_point);
    this.panel.addItem(this.left_up_point);




    /**********************************************初始化顶点坐标信息*******************************************/
        //先从GL申请一个缓存数组
    this.vertexPositionBuffer = gl.createBuffer();

    //把这个缓存丢入到GL的状态机里
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);

    //注意这里的坐标,在WEBGL中默认坐标点是在屏幕的中心点,和我们之前使用canvas不一样,X轴正号为右,Y轴正号为上,
    //我不太习惯这个坐标系,不过没有关系,我们先用默认的坐标来处理图像,后续我们可以利用矩阵
    //改变成自己的左上角坐标系,现在我们通过4个顶点坐标定义了一个四角形,所以我们的四角形的宽度和高度是2，这里
    //是重点,不要看成是1拉,因为-1和1表示的长度为2,之后我们需要这个2来算出实际的图像大小,所以,这里的顶点循序是
    //左下角,右下角,右上角,左上角
    var vertices = [
        this.left_down_point.getX(),this.left_down_point.getY(),//左下角
        this.right_down_point.getX(),this.right_down_point.getY(),//右下角
        this.right_up_point.getX(), this.right_up_point.getY(),//右上角
        this.left_up_point.getX(), this.left_up_point.getY()//左上角
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    /**********************************************初始化UV信息*******************************************/

        //上传这个顶点数据到WEBGL的状态机里,这里有点难理解,WBEGL是过程式的,因为我们上面的操作是已经上传了顶点的缓存数
        // 组到状态机通过使用参数gl.STATIC_DRAW,告诉告诉状态机,现在上传的是这个缓存数组里的具体参数,参数是浮点数
    //申请一个UV的缓存数组
    this.vertexTextureUvdBuffer = gl.createBuffer();

    //又上传到WEBGL的状态机里,
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureUvdBuffer);

    //这里就是传说中的UV,还记得0和1吗,1代表原图的最大采样区域,如果我们要显示一个完整的原图,就需要设置各个顶点的UV坐标
    //它对应的是顶点坐标,通过设置UV信息着色器会帮我们计算插值坐标
    var textureCoords = [
        0, 0.0,//左下角
        1.0, 0.0,//右下角
        1.0, 1.0,//右上角
        0.0, 1.0//左上角
    ];

    //再一次上传到数据到状态机里,原理同上
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);



    /**********************************************初始化顶点索引*******************************************/

        //申请一个顶点索引的缓存数组
    this.vertexIndexBuffer = gl.createBuffer();

    //上传到WEBGL的状态机里
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);

    //设置顶点绘制的循序,WBEGL会根据你的这个循序去渲染你的图像,通常你可以利用这里改变你的图像的排序循序,这里渲染的是
    //两个三角形,因为我们是做2D,两个三角形是有两个共享点的
    var vertexIndices = [
        0, 1, 2, 0, 2, 3
    ];
    //这里的上传类型改变为长整形了,Uint16Array,这里是一个坑,在其他语言里你上传错误的数据类型不会报错,但是会显示很奇怪,
    //以前我就被这个坑了一个下午,因为索引ID没有小数
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);

    this.x=0;
    this.y=0;
    this.scaleX=1;
    this.scaleY=1;
    this.rotation=0;
    this.biasX=0;
    this.biasY=0;
    this.pivotX=0;
    this.pivotY=0;

    //渲染刷新函数
    this.paint=function()
    {
        //填充数据
        this.panel.setX(this.x*2/stageHeight);

        //强制转换成笛卡尔第四象限坐标系
        this.panel.setY(-this.y*2/stageHeight);
        this.panel.setRotation(this.rotation);
        this.panel.setScaleX(this.scaleX);
        this.panel.setScaleY(this.scaleY);
        this.panel.setBiasX(this.biasX);
        this.panel.setBiasY(this.biasY);
        this.panel.setPivotX(this.pivotX);
        this.panel.setPivotY(this.pivotY);

        //更新面板的矩阵信息
        this.panel.upDataMatrix();

        //把这个缓存丢入到GL的状态机里
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);

        //注意这里的坐标,在WEBGL中默认坐标点是在屏幕的中心点,和我们之前使用canvas不一样,X轴正号为右,Y轴正号为上,
        //我不太习惯这个坐标系,不过没有关系,我们先用默认的坐标来处理图像,后续我们可以利用矩阵
        //改变成自己的左上角坐标系,现在我们通过4个顶点坐标定义了一个四角形,所以我们的四角形的宽度和高度是2，这里
        //是重点,不要看成是1拉,因为-1和1表示的长度为2,之后我们需要这个2来算出实际的图像大小,所以,这里的顶点循序是
        //左下角,右下角,右上角,左上角
        var vertices = [
            this.left_down_point.getX(),this.left_down_point.getY(),//左下角
            this.right_down_point.getX(),this.right_down_point.getY(),//右下角
            this.right_up_point.getX(), this.right_up_point.getY(),//右上角
            this.left_up_point.getX(), this.left_up_point.getY()//左上角
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        //又上传到WEBGL的状态机里,
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureUvdBuffer);

        //这里就是传说中的UV,还记得0和1吗,1代表原图的最大采样区域,如果我们要显示一个完整的原图,就需要设置各个顶点的UV坐标
        //它对应的是顶点坐标,通过设置UV信息着色器会帮我们计算插值坐标
        var textureCoords = [
            0, 0.0,//左下角
            1.0, 0.0,//右下角
            1.0, 1.0,//右上角
            0.0, 1.0//左上角
        ];

        //再一次上传到数据到状态机里,原理同上
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);



        //这里只是测试代码,在实际操作中,不会反复创建顶点缓存,但是会根据顶点数据更改去更新缓存里的数据,如果你迫不及待想
        //看到效果或者你的电脑内存够大的话,你可以先加入这段初始化代码看看效果



        //上传顶点数据到WEBGL的状态机
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPositionBuffer);

        //设置顶点着色器接受缓存的数组并且上传到着色器,我们只用了二维,所以是2,类型为浮点数,flase是不需要转换为单位向量,这个
        //矩阵会用到,或者是法线贴图的数据,现在用不到,后面是开始位置和间隔位置,实际上你可以在一个缓存数组里放所有的信息
        //这样理论上会节省空间和提升效率,但我在其他平台上测试,分开的优势比较大,WEBGL的还没有测试过,现在默认是0,0
        gl.vertexAttribPointer(this.shader.shaderProgram.vertexPositionAttribute,2, gl.FLOAT, false, 0, 0);


        //同上理,上传UV信息到WEBGL状态机
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureUvdBuffer);
        //同上理
        gl.vertexAttribPointer(this.shader.shaderProgram.textureCoordAttribute,2, gl.FLOAT, false, 0, 0);


        //上传纹理信息到WBEGL状态机
        gl.bindTexture(gl.TEXTURE_2D,this.texture.newTexture);

        //这里是一个坑,因为是面向过程的,循序不能错,把纹理上传到WEBGL状态机后,要紧接着上传到着色器,uSampler是和像素着色器对应
        //好的寄存器名称,后面的参数,没见过,默认吧,默认吧,
        gl.uniform1i(gl.getUniformLocation(this.shader.shaderProgram,"uSampler"), 0);

        //第一个参数我们把刚才初始化的一维数组传递进来,第二个参数是左右的缩放的系数,通常我们使用场景的高度为确定值,宽度则
        // 是利用场景的宽度/高度这样的系数动态改变,通常的参数分为左边和右边,后面的-1,1是高度比,上面和下面,这里有一个小技巧
        // 你可以同时给这4个参数加上一个值来做镜头的移动,最后2个参数是近截面和远截面,什么意思呢?因为我们人类观察物体是有一
        // 个盲区的,比如,你可以把你的手机近距离的靠近你的眼睛,这时候你是看不清楚手机的,你甚至无法分辨它是一个手机还是一个
        // 其他的物体,并且会产生重影,如果你把手机放远了看,你一样是看不清,所以我们人类观察任何物体都是在离人眼一定距离和范
        // 围之内的,在3D中,小于这个范围的为了节省性能会被删除掉不显示,远了也一样,否则显示器不像人眼,你永远无法让你的手机
        // 无限的靠近你的眼球,因为你有鼻梁,有骨骼,而在显示器里则会无限制的放大,但其实这是无意义的,所以你在玩某个3D游戏穿
        // 越某个物体时它在一定的距离后会消失不见就是这个原因.
        //强制转换成笛卡尔第四象限坐标系
        orthoM(oRMatrixList,-ratio-ratio,ratio-ratio,-1-1,1-1, -10, 1000);

        //上传正交矩阵,先在着色器中查询对应的矩阵寄存器名称然后把结果上传,后面的参数是否转置矩阵,默认吧,最后的参数是接受
        //一个一维数组,也就是我们计算4*4的矩阵,长度为16的一维数组
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader.shaderProgram, "oRMatrix"),false,oRMatrixList);

        //上传顶点索引到WBEGL状态机
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.vertexIndexBuffer);
        //通过刚上传的顶点索引绘制三角形,一共有6个顶点,类型为整形,间隔为0
        gl.drawElements(gl.TRIANGLES,6, gl.UNSIGNED_SHORT, 0);
    }

}


/**
 * 着色器
 */
function Shader()
{
    //创建一个着色器程序
    this.shaderProgram = gl.createProgram();

    //获取顶点着色器
    var vertexShader = getShader(gl, "shader-vs");

    //获取像素着色器
    var fragmentShader = getShader(gl, "shader-fs");


    //把顶点着色器上传到这个着色器程序里
    gl.attachShader(this.shaderProgram, vertexShader);

    //把像素着色器上传到这个着色器程序里
    gl.attachShader(this.shaderProgram, fragmentShader);

    //链接这个着色器
    gl.linkProgram(this.shaderProgram);

    //如果你创建失败了,那你又写错代码了
    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    //把这个着色器上传到GPU
    gl.useProgram(this.shaderProgram);

    //还记得aVertexPosition个寄存器的名称么,这是对应到顶点着色器的,getAttribLocation这句话的意思是,从这个着色器程序里
    //获得一个叫aVertexPosition的寄存器名称,然后赋值给shaderProgram.vertexPositionAttribute
    this.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");

    //绑定这个寄存器属性
    gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

    //原理同上,名称要一一对应
    this.shaderProgram.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureUv");
    gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
}

/**
 * 2D纹理对象
 */
function Texture2D(v_image)
{
    //申请一个纹理
    this.newTexture = gl.createTexture();
    //开始WEBGL纹理功能,这是一个坑,如果你的程序没有报错,但是不显示图片看看这里有没有开启
    gl.activeTexture(gl.TEXTURE0);

    //和上传顶点的过程是一样一样的,把这个纹理对象上传到WEBGL的状态机里
    gl.bindTexture(gl.TEXTURE_2D,this.newTexture);

    //这个函数之前没见过,看样子你不这样子设置画面会反转,那就这样设置吧
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //核心函数,利用newTexture.image生成纹理,我们实际渲染的不是load进来的图片而是一个纹理,后面的0参数看起来是纹理等级
    //的意思,在3D中会有多级纹理,比如1024*1024 512*512 256*256 ...一直到最小,这个操作是方便在远处的贴图以小精度也就是
    //等级显示,这样就不需要利用大图缩放而损失画面质量了,不过我们的2D游戏不会用到这个功能,后面的参数看起来是设置图像
    //的一些颜色信息,默认吧,默认吧
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v_image);

    //缩放的采样模式,这里是设置图像被放大时采样模式,为临近采样模式,这个参数很常用你最好把它封装起来,初始化时方便你
    //选择
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    //这里是设置缩小时的采样模式,原理同上,
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    //清空状态机里的纹理,这里只是清除引用而已,不是清楚纹理,纹理我们已经经过状态机加工过了
    gl.bindTexture(gl.TEXTURE_2D, null);
}