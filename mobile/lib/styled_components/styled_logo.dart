import 'package:flutter/material.dart ';

class StyledLogo extends StatelessWidget {
  const StyledLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 100,
      child: Image.asset(
        'assets/img/logo2.png',
        height: 60,
        width: 185,
        color: Colors.white,
      ),
    );
  }
}
