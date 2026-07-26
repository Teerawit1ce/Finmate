import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../providers/finance_provider.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isTyping = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send(String text) {
    if (text.trim().isEmpty) return;
    final p = context.read<FinanceProvider>();

    setState(() => _isTyping = true);

    p.addMessage(ChatMessage(
      id: 'u_${DateTime.now().millisecondsSinceEpoch}',
      role: 'user',
      text: text.trim(),
    ));
    _controller.clear();

    Future.delayed(const Duration(milliseconds: 700), () {
      final r = p.processChat(text.trim());
      if (r.text.isNotEmpty) {
        p.addMessage(ChatMessage(
          id: 'a_${DateTime.now().millisecondsSinceEpoch}',
          role: 'assistant',
          text: r.text,
          actions: r.actions,
        ));
      }
      setState(() => _isTyping = false);
      _scrollToBottom();
    });
  }

  void _handleAction(String handler, FinanceProvider p) {
    switch (handler) {
      case 'cancel-netflix':
        p.cancelNetflix();
        break;
      case 'check':
        _send('เงินจะหมดแล้ว');
        break;
      case 'subs':
        p.setTab(2);
        break;
      case 'dashboard':
        p.setTab(0);
        break;
      case 'hello':
        _send('สวัสดี');
        break;
    }
  }

  String _render(String text) {
    return text.replaceAll(RegExp(r'\*\*(.+?)\*\*'), '<b>\$1</b>');
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceProvider>(
      builder: (context, p, _) => Column(children: [
        // Header — minimal
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppTheme.borderDark)),
          ),
          child: Row(children: [
            Text('Finmate', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: AppTheme.textPrimary)),
            const Spacer(),
            Text('AI Agent', style: TextStyle(fontSize: 11, color: AppTheme.textTertiary)),
          ]),
        ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: p.messages.length + (_isTyping ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= p.messages.length) {
                return _typingIndicator();
              }
              final msg = p.messages[index];
              final isUser = msg.role == 'user';
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Column(crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start, children: [
                  if (!isUser)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6, left: 2),
                      child: Text('Finmate', style: TextStyle(fontSize: 10, color: AppTheme.textTertiary)),
                    ),
                  Container(
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                    decoration: BoxDecoration(
                      color: isUser ? AppTheme.primary.withAlpha(200) : AppTheme.surfaceDark,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(14),
                        topRight: const Radius.circular(14),
                        bottomLeft: Radius.circular(isUser ? 14 : 4),
                        bottomRight: Radius.circular(isUser ? 4 : 14),
                      ),
                      border: isUser ? null : Border.all(color: AppTheme.borderDark, width: 0.5),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _buildRichText(_render(msg.text)),
                      if (msg.actions != null && msg.actions!.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 10),
                          child: Wrap(spacing: 8, runSpacing: 6, children: msg.actions!.map((a) {
                            return GestureDetector(
                              onTap: () => _handleAction(a.handler, p),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppTheme.primary.withAlpha(100)),
                                  color: AppTheme.primary.withAlpha(20),
                                ),
                                child: Text(a.label, style: TextStyle(fontSize: 11, color: AppTheme.primaryLight)),
                              ),
                            );
                          }).toList()),
                        ),
                    ]),
                  ),
                ]),
              );
            },
          ),
        ),

        // Quick Chips
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: ['🍜 กินข้าว 60', '💰 เงินจะหมดแล้ว', '📋 sub', '📊 ใช้เงินเปลือง'].map((chip) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => _send(chip.split(' ').skip(1).join(' ')),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: AppTheme.surfaceMid,
                      border: Border.all(color: AppTheme.borderDark, width: 0.5),
                    ),
                    child: Text(chip, style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ),
                ),
              );
            }).toList()),
          ),
        ),

        // Input
        Container(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: AppTheme.borderDark)),
          ),
          child: Row(children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.borderDark, width: 0.5),
                ),
                child: TextField(
                  controller: _controller,
                  onSubmitted: _send,
                  style: TextStyle(fontSize: 14, color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'พิมพ์รายจ่ายของคุณ...',
                    hintStyle: TextStyle(color: AppTheme.textTertiary, fontSize: 14),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => _send(_controller.text),
              child: Container(
                width: 38, height: 38,
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.arrow_upward_rounded, size: 18, color: AppTheme.textPrimary),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _typingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppTheme.surfaceDark,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.borderDark, width: 0.5),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: List.generate(3, (i) => _dot(i * 150))),
        ),
      ]),
    );
  }

  Widget _dot(int delay) {
    return AnimatedPadding(
      duration: Duration(milliseconds: 300 + delay),
      padding: EdgeInsets.only(top: _isTyping ? 0 : 4),
      child: Container(
        width: 6, height: 6, margin: const EdgeInsets.only(right: 4),
        decoration: BoxDecoration(shape: BoxShape.circle, color: AppTheme.textTertiary),
      ),
    );
  }

  Widget _buildRichText(String html) {
    final spans = <TextSpan>[];
    final regex = RegExp(r'<b>(.+?)</b>');
    int last = 0;
    for (final match in regex.allMatches(html)) {
      if (match.start > last) {
        spans.add(TextSpan(text: html.substring(last, match.start)));
      }
      spans.add(TextSpan(text: match.group(1), style: const TextStyle(fontWeight: FontWeight.w600)));
      last = match.end;
    }
    if (last < html.length) {
      spans.add(TextSpan(text: html.substring(last)));
    }
    return Text.rich(
      TextSpan(children: spans),
      style: TextStyle(fontSize: 14, height: 1.6, color: AppTheme.textPrimary),
    );
  }
}
