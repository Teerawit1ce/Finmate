import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class SubscriptionsScreen extends StatelessWidget {
  const SubscriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) {
        final active = p.activeSubscriptions;
        final total = p.totalMonthlySubs;
        final colors = [AppTheme.primaryLight, AppTheme.success, AppTheme.warning, AppTheme.error];

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Subscriptions', style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w500,
              color: AppTheme.textTertiary, letterSpacing: 0.8,
            )),
            const SizedBox(height: 4),
            Text('${active.length} รายการ · ${p.fmt(total)}/เดือน',
              style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 20),

            ...p.subscriptions.asMap().entries.map((entry) {
              final i = entry.key;
              final sub = entry.value;
              final billing = DateTime.tryParse(sub.nextBilling);
              final dueSoon = sub.active && billing != null && billing.difference(DateTime.now()).inDays <= 3;
              final color = colors[i % colors.length];

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: sub.active ? AppTheme.surfaceDark : AppTheme.surfaceDark.withAlpha(180),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: dueSoon
                        ? AppTheme.warning.withAlpha(100)
                        : AppTheme.borderDark,
                    width: 0.5,
                  ),
                ),
                child: Row(children: [
                  // Dot
                  Container(
                    width: 8, height: 8,
                    decoration: BoxDecoration(
                      color: sub.active ? color.withAlpha(200) : AppTheme.textTertiary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Info
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text(sub.name, style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: sub.active ? AppTheme.textPrimary : AppTheme.textSecondary)),
                      if (dueSoon)
                        Container(
                          margin: const EdgeInsets.only(left: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: AppTheme.warning.withAlpha(25),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('${billing!.difference(DateTime.now()).inDays} วัน', style: TextStyle(fontSize: 9, color: AppTheme.warning.withAlpha(200))),
                        ),
                    ]),
                    const SizedBox(height: 1),
                    Text('ตัดวันที่ ${sub.billingDay}', style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                  ])),

                  // Amount
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text(p.fmt(sub.amount), style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: AppTheme.textPrimary)),
                    Text('/เดือน', style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                  ]),
                  const SizedBox(width: 8),

                  // Toggle
                  GestureDetector(
                    onTap: () => p.toggleSubscription(sub.id),
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: sub.active
                            ? AppTheme.error.withAlpha(15)
                            : AppTheme.primary.withAlpha(15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        sub.active ? Icons.notifications_off_outlined : Icons.notifications_outlined,
                        size: 16,
                        color: sub.active ? AppTheme.error.withAlpha(180) : AppTheme.primary.withAlpha(180),
                      ),
                    ),
                  ),
                ]),
              );
            }),
          ]),
        );
      },
    );
  }
}
