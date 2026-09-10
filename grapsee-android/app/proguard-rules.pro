# Keep the JS bridge methods callable from JavaScript.
-keepclassmembers class com.grapsee.shop.core.web.NativeBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.grapsee.shop.core.web.NativeBridge { *; }

# kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class kotlinx.serialization.json.** { kotlinx.serialization.KSerializer serializer(...); }
-keep,includedescriptorclasses class com.grapsee.shop.**$$serializer { *; }
-keepclassmembers class com.grapsee.shop.** { *** Companion; }
-keepclasseswithmembers class com.grapsee.shop.** { kotlinx.serialization.KSerializer serializer(...); }
