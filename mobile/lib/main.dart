import 'package:flutter/material.dart';
import 'package:mobile/aboutsc1.dart';
import 'package:mobile/create.dart';
import 'package:mobile/createparent.dart';
import 'package:mobile/createparent2.dart';
import 'package:mobile/createstudent.dart';
import 'package:mobile/createstudent2.dart';
import 'package:mobile/home.dart';
import 'package:mobile/login.dart';
import 'package:mobile/roleselection.dart';
import 'package:mobile/timer.dart';
import 'package:mobile/todo.dart';

void main() {
  runApp(
    const MaterialApp(
      debugShowCheckedModeBanner: false, // Removes the debug banner
      home: Todo(), // Sets Home as the initial screen
    ),
  );
}
