import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Todo extends StatefulWidget {
  const Todo({super.key});

  @override
  State<Todo> createState() => _TodoState();
}

class _TodoState extends State<Todo> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          const SizedBox(height: 150, width: 20),
          Container(
            child:const Text('Menu'),
          ),
          const SizedBox(width: 200),
          Container(
            child: Image.asset('assets/img/logo2.png', height: 40, width: 140),
          ),
        ],
      )),
    );
  }
}
