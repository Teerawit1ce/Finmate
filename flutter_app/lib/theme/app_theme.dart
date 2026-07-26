import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Primary — ใช้อย่างประหยัด เฉพาะปุ่ม CTA / selected state
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryLight = Color(0xFF3B82F6);

  // Semantic
  static const Color success = Color(0xFF059669);
  static const Color error = Color(0xFFDC2626);
  static const Color warning = Color(0xFFD97706);

  // พื้นหลัง minimal
  static const Color bgDark = Color(0xFF0D0E12);
  static const Color surfaceDark = Color(0xFF16181D);
  static const Color surfaceMid = Color(0xFF1E2028);
  static const Color borderDark = Color(0xFF262830);

  // ข้อความ — softer, ไม่แข็งกระด้าง
  static const Color textPrimary = Color(0xFFE8E8ED);
  static const Color textSecondary = Color(0xFF94969B);
  static const Color textTertiary = Color(0xFF5C5E66);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: primaryLight,
        surface: surfaceDark,
        error: error,
      ),
      textTheme: GoogleFonts.kanitTextTheme().copyWith(
        headlineLarge: TextStyle(
          fontSize: 24, fontWeight: FontWeight.w600, color: textPrimary,
          letterSpacing: -0.3,
        ),
        headlineMedium: TextStyle(
          fontSize: 17, fontWeight: FontWeight.w500, color: textPrimary,
        ),
        titleMedium: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w500, color: textPrimary,
        ),
        bodyMedium: TextStyle(
          fontSize: 14, color: textPrimary, height: 1.5,
        ),
        bodySmall: TextStyle(
          fontSize: 12, color: textSecondary, height: 1.4,
        ),
        labelSmall: TextStyle(
          fontSize: 11, color: textTertiary,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: borderDark, width: 0.5),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgDark,
        selectedItemColor: primary,
        unselectedItemColor: textTertiary,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      dividerColor: borderDark,
      dividerTheme: DividerThemeData(color: borderDark, thickness: 0.5, space: 0),
      useMaterial3: true,
    );
  }
}
