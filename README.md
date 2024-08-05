<div align=center>

![](https://avatars.githubusercontent.com/u/9950313?s=48&v=4)
# nanode
The minimalist builds of Node.JS.

[Try Now](https://github.com/MicroCBer/nanode/releases)

## Build types
|Name|Explanation|
|---|---|
|lto|The build was built with link-time optimizations.|
|clang|The build was built with clang instead of gcc/msvc.|
|ptr_compr|The build was built with experimental pointer compression enabled.|
|icu_none|The build was built without any intl support, which means `Intl.xxx` part would be missing, and JS features like `.toLocaleString()` would be unavailable.|
|icu_system|The build was built with intl support with system icu. [More details.](https://nodejs.org/api/intl.html#build-with-a-pre-installed-icu-system-icu)|
|upx|The build was wrapped with [upx](https://github.com/upx/upx) packer.|
|v8_opts|The build was built without v8/Node.JS debugging features.|
|nojit|The build was built without v8 Just-in-Time compilation support.|


</div>
