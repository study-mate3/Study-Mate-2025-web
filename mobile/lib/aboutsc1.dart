import 'package:flutter/material.dart';

class Aboutsc1 extends StatelessWidget {
  const Aboutsc1({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 106),
          children: [
            Container(
              child: Image.asset(
                'assets/img/logo2.png',
                height: 42,
                width: 148,
              ),
            ),
            const SizedBox(height: 40),
            Container(
              child: const Text('Boost focus with the Promodoro \n Technique!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF057082))),
            )
          ],
        ),
      ),
    );
  }
}
