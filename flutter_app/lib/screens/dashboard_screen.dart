import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) {
        final cats = p.expenseByCategory.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
        final catTotal = cats.fold(0.0, (sum, e) => sum + e.value);
        final recent = p.recentTransactions;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Greeting — minimal
            Text('ภาพรวม', style: Theme.of(context).textTheme.bodySmall?.copyWith(
              fontSize: 11, color: AppTheme.textTertiary, letterSpacing: 0.8,
            )),
            const SizedBox(height: 4),
            Text('ยอดคงเหลือ', style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontSize: 14, fontWeight: FontWeight.w400, color: AppTheme.textSecondary,
            )),
            const SizedBox(height: 2),
            Text(p.fmt(p.balance), style: TextStyle(
              fontSize: 32, fontWeight: FontWeight.w500,
              color: AppTheme.textPrimary, letterSpacing: -0.5,
            )),
            const SizedBox(height: 14),

            // Income / Expense Row — flat, no gradient
            Row(children: [
              _miniCard(Icons.trending_up, 'รายรับ', p.fmt(p.monthlyIncome), AppTheme.success),
              const SizedBox(width: 8),
              _miniCard(Icons.trending_down, 'รายจ่าย', p.fmt(p.monthlyExpense), AppTheme.error),
            ]),
            const SizedBox(height: 20),

            // Warning
            if (p.dueSoonSubs.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.warning.withAlpha(15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.warning.withAlpha(40)),
                ),
                child: Row(children: [
                  Icon(Icons.warning_amber_rounded, color: AppTheme.warning.withAlpha(200), size: 18),
                  const SizedBox(width: 10),
                  Expanded(child: Text(
                    '⚠️ ${p.dueSoonSubs.length} Subscription กำลังจะตัด',
                    style: TextStyle(color: AppTheme.warning, fontSize: 13),
                  )),
                ]),
              ),
            if (p.dueSoonSubs.isNotEmpty) const SizedBox(height: 20),

            // Category Breakdown
            Text('สัดส่วนค่าใช้จ่าย', style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.textSecondary,
            )),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.borderDark, width: 0.5),
              ),
              child: Column(children: [
                // Bar
                Row(children: cats.take(4).toList().asMap().entries.map((e) {
                  final pct = catTotal > 0 ? (e.value.value / catTotal * 100) : 0.0;
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: const EdgeInsets.symmetric(horizontal: 1),
                      decoration: BoxDecoration(
                        color: [AppTheme.primaryLight, AppTheme.success, AppTheme.warning, AppTheme.error][e.key % 4].withAlpha(150),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }).toList()),
                const SizedBox(height: 12),
                ...cats.take(4).map((e) {
                  final pct = catTotal > 0 ? (e.value / catTotal * 100) : 0.0;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: Row(children: [
                      Text(e.key, style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      const Spacer(),
                      Text('${pct.toStringAsFixed(0)}%', style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
                      const SizedBox(width: 10),
                      Text(p.fmt(e.value), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
                    ]),
                  );
                }),
              ]),
            ),
            const SizedBox(height: 20),

            // Recent Transactions
            Text('รายการล่าสุด', style: TextStyle(
              fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.textSecondary,
            )),
            const SizedBox(height: 10),
            ...recent.map((t) => Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppTheme.borderDark, width: 0.3)),
              ),
              child: Row(children: [
                Container(
                  width: 6, height: 6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: t.isIncome ? AppTheme.success.withAlpha(180) : AppTheme.error.withAlpha(180),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(t.description, style: TextStyle(fontSize: 13, color: AppTheme.textPrimary)),
                  Text(t.date, style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                ])),
                Text(
                  '${t.isIncome ? '+' : '-'}${p.fmt(t.amount)}',
                  style: TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w500,
                    color: t.isIncome ? AppTheme.success.withAlpha(200) : AppTheme.error.withAlpha(200),
                  ),
                ),
              ]),
            )),
          ]),
        );
      },
    );
  }

  Widget _miniCard(IconData icon, String label, String amount, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surfaceDark,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.borderDark, width: 0.5),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(icon, size: 14, color: color.withAlpha(180)),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
          ]),
          const SizedBox(height: 6),
          Text(amount, style: TextStyle(
            fontSize: 17, fontWeight: FontWeight.w500, color: AppTheme.textPrimary,
          )),
        ]),
      ),
    );
  }
}
